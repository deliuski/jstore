import { setGlobalOptions } from 'firebase-functions'
import { defineSecret } from 'firebase-functions/params'
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import { initializeApp, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import {
  BonumGatewayClient,
  parseWebhookEvent,
  verifyWebhookChecksum,
} from '@mongolian-payment/bonum'

// Declaring the secrets here makes them available as process.env.* inside the
// functions and pins them to every function in this codebase (v2 requirement).
const BONUM_APP_SECRET = defineSecret('BONUM_APP_SECRET')
const BONUM_TERMINAL_ID = defineSecret('BONUM_TERMINAL_ID')
const BONUM_MERCHANT_CHECKSUM_KEY = defineSecret('BONUM_MERCHANT_CHECKSUM_KEY')
/** The storefront URL (Vercel) — where a paying browser is sent back to. */
const SITE_URL_SECRET = defineSecret('SITE_URL')

setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
  secrets: [BONUM_APP_SECRET, BONUM_TERMINAL_ID, BONUM_MERCHANT_CHECKSUM_KEY, SITE_URL_SECRET],
})

// Lazy Admin SDK init: `firebase deploy` loads this module to discover the
// functions, and initializing there (no credentials in that sandbox) hangs
// until the deploy times out. First real request initializes instead.
let app: App | undefined
let firestore: Firestore | undefined
function db(): Firestore {
  if (!firestore) {
    app ??= initializeApp()
    firestore = getFirestore(app)
  }
  return firestore
}

/**
 * Bonum gateway credentials live in Secret Manager — never in the client code:
 *   firebase functions:secrets:set BONUM_APP_SECRET
 *   firebase functions:secrets:set BONUM_TERMINAL_ID
 *   firebase functions:secrets:set BONUM_MERCHANT_CHECKSUM_KEY   (webhook checksum)
 *   firebase functions:secrets:set SITE_URL                      (Vercel storefront)
 *
 * The base URL switches the environment:
 *   https://testapi.bonum.mn — test
 *   https://apis.bonum.mn    — production
 */
const BASE_URL = process.env.BONUM_BASE_URL ?? 'https://testapi.bonum.mn'

function bonumClient(): BonumGatewayClient {
  // trim(): secrets entered via the CLI can carry a trailing newline, and Node's
  // fetch throws "Invalid character in header content" before any request goes out.
  const appSecret = (process.env.BONUM_APP_SECRET ?? '').trim()
  const terminalId = (process.env.BONUM_TERMINAL_ID ?? '').trim()
  if (!appSecret || !terminalId) {
    throw new HttpsError(
      'failed-precondition',
      'Төлбөрийн систем хараахан холбогдоогүй. Арай хожим дахин оролдоно уу.',
    )
  }
  // One shared client reuses its Bearer token; Bonum rate-limits new auth requests.
  return new BonumGatewayClient({
    baseUrl: BASE_URL,
    appSecret,
    terminalId,
    checksumKey: process.env.BONUM_MERCHANT_CHECKSUM_KEY,
  })
}

/** The storefront URL — where the paying browser is sent back (Vercel domain). */
const siteUrl = () => process.env.SITE_URL ?? 'https://jstore-henna.vercel.app'

/**
 * The public URL of the `bonumWebhook` function — passed to Bonum as the
 * invoice `callback` and registered in Bonum's merchant portal. It is
 * dual-purpose: Bonum's server-to-server result arrives as POST, and if the
 * payer's browser is redirected here (GET) we bounce them to the success page.
 */
const webhookUrl = () =>
  process.env.BONUM_WEBHOOK_URL ??
  `https://us-central1-${process.env.GCLOUD_PROJECT ?? 'ger-fx'}.cloudfunctions.net/bonumWebhook`

/**
 * Creates a Bonum invoice for an existing order and opens the payment window.
 * The amount always comes from the Firestore order, never from the client.
 */
export const createBonumInvoice = onCall(async (request) => {
  const orderId = String(request.data?.orderId ?? '')
  const amount = Number(request.data?.amount ?? 0)

  const orderRef = db().doc(`orders/${orderId}`)
  const orderSnap = await orderRef.get()
  if (!orderSnap.exists) {
    throw new HttpsError('not-found', 'Захиалга олдсонгүй')
  }
  const order = orderSnap.data() as {
    number: number
    subtotal: number | null
    payment: { status: string }
  }

  if (order.payment?.status === 'paid') {
    throw new HttpsError('failed-precondition', 'Энэ захиалга аль хэдийн төлөгдсөн байна')
  }

  // Trust the stored subtotal; fall back to the client amount only when null.
  const invoiceAmount = order.subtotal ?? amount
  if (!(invoiceAmount > 0)) {
    throw new HttpsError('failed-precondition', 'Захиалгын дүн тодорхойгүй — дэлгүүртэй холбогдоно уу')
  }

  // Bonum allows one invoice per transactionId: retrying an unpaid order needs
  // a unique id per attempt (the webhook still maps back via payment.reference).
  // A paid order must not open a new invoice, so it is rejected above.
  const transactionId = `${orderId}-${Date.now()}`
  let invoice
  try {
    invoice = await bonumClient().createInvoice({
      amount: invoiceAmount,
      transactionId,
      callback: webhookUrl(),
      // Bonum's API rejects invoices without expiresIn (500 "Missing required
      // creator property expiresIn") even though the SDK types it optional.
      expiresIn: 3600,
    })
  } catch (err) {
    // Log the real Bonum failure (status + path) for debugging; the user only
    // sees a friendly message.
    console.error('Bonum createInvoice failed', err instanceof Error ? err.message : err)
    throw new HttpsError('internal', 'Төлбөрийн системтэй холбогдож чадсангүй. Арай хожим дахин оролдоно уу.')
  }

  await orderRef.update({
    'payment.provider': 'bonum',
    'payment.reference': invoice.invoiceId,
    updatedAt: FieldValueServerTimestamp(),
  })

  return { invoiceId: invoice.invoiceId, payUrl: invoice.followUpLink }
})

/** serverTimestamp, imported lazily alongside the Admin SDK. */
function FieldValueServerTimestamp() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { FieldValue } = require('firebase-admin/firestore') as typeof import('firebase-admin/firestore')
  return FieldValue.serverTimestamp()
}

/**
 * Bonum posts the payment result here. The checksum header is verified with the
 * merchant checksum key; then the order is marked paid / failed.
 */
export const bonumWebhook = onRequest(async (req, res) => {
  // A browser redirected here after paying (Bonum's `callback`) lands as GET:
  // send the payer to the success page instead of an API error.
  if (req.method === 'GET') {
    const orderParam = String(req.query.transactionId ?? req.query.order ?? req.query.id ?? '')
    // transactionId is `${orderId}-${Date.now()}`: the leading digits are the order.
    let number = /^(\d+)-/.exec(orderParam)?.[1] ?? (/^\d+$/.test(orderParam) ? orderParam : null)
    if (!number && orderParam) {
      // Only an invoiceId came back — map it to the order via payment.reference.
      const snap = await db().collection('orders').where('payment.reference', '==', orderParam).limit(1).get()
      const docSnap = snap.docs[0]
      if (docSnap) number = String(docSnap.get('number') ?? '') || null
    }
    const base = String(req.query.return ?? siteUrl()).replace(/\/$/, '')
    res.redirect(302, `${base}/order/success${number ? `?order=${number}` : ''}`)
    return
  }

  if (req.method !== 'POST') {
    res.set('Allow', 'GET, POST').sendStatus(405)
    return
  }

  const checksumKey = process.env.BONUM_MERCHANT_CHECKSUM_KEY
  // Cloud Functions v2 exposes the un-parsed request bytes here — checksum must
  // be verified over the exact bytes Bonum signed (re-serializing JSON changes
  // spacing/key order and breaks the HMAC).
  const rawBody = req.rawBody ? Buffer.from(req.rawBody).toString('utf8') : typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})
  const header = req.header('x-checksum-v2') ?? ''

  if (checksumKey && !verifyWebhookChecksum(rawBody, header, checksumKey)) {
    res.sendStatus(401)
    return
  }

  const event = parseWebhookEvent(rawBody)
  // Bonum puts the merchant transaction id inside `body` (top level is a
  // legacy fallback). CARD-TOKEN / SUBSCRIPTION events are not used here.
  const payload = event as { type?: string; body?: { transactionId?: string }; transactionId?: string }
  // transactionId is `${orderId}-${Date.now()}` — strip the retry suffix.
  const rawTransactionId = String(payload.body?.transactionId ?? payload.transactionId ?? '')
  const orderId = /^(\d+)-/.exec(rawTransactionId)?.[1] ?? rawTransactionId
  const ok = event.status === 'SUCCESS'

  if (!orderId) {
    res.sendStatus(400)
    return
  }

  const orderRef = db().doc(`orders/${orderId}`)
  const orderSnap = await orderRef.get()
  if (!orderSnap.exists) {
    res.sendStatus(404)
    return
  }

  if (ok) {
    // Same stock logic as the admin's updateOrderStatus: moving into paid takes items out of stock.
    await db().runTransaction(async (tx) => {
      const snap = await tx.get(orderRef)
      if (!snap.exists) return
      const order = snap.data() as {
        items: { productId: string; size: string | null; qty: number }[]
        status: string
        stockDeducted: boolean
        payment: { status: string }
      }
      if (order.payment.status === 'paid') return

      const shouldDeduct = order.status !== 'cancelled'
      const deduct = shouldDeduct && !order.stockDeducted

      const productRefs = [...new Set(order.items.map((item) => item.productId))].map((id) =>
        db().doc(`products/${id}`),
      )
      const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)))

      for (const productSnap of productSnaps) {
        if (!productSnap.exists) continue
        const product = productSnap.data() as { stock: number; sizes: { label: string; stock: number }[] }
        let { stock } = product
        const sizes = product.sizes.map((size) => ({ ...size }))
        for (const item of order.items) {
          if (item.productId !== productSnap.id) continue
          const change = item.qty * (deduct ? -1 : 0)
          const size = item.size === null ? undefined : sizes.find((s) => s.label === item.size)
          if (size) size.stock = Math.max(0, size.stock + change)
          else stock = Math.max(0, stock + change)
        }
        tx.update(productSnap.ref, { sizes, stock })
      }

      tx.update(orderRef, {
        status: 'paid',
        'payment.status': 'paid',
        stockDeducted: deduct ? true : order.stockDeducted,
        updatedAt: FieldValueServerTimestamp(),
      })
    })
  } else {
    await orderRef.update({
      'payment.status': 'failed',
      updatedAt: FieldValueServerTimestamp(),
    })
  }

  res.sendStatus(200)
})
