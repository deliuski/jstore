import { setGlobalOptions } from 'firebase-functions'
import { defineSecret } from 'firebase-functions/params'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onRequest } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
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

setGlobalOptions({ region: 'us-central1', maxInstances: 10, secrets: [BONUM_APP_SECRET, BONUM_TERMINAL_ID, BONUM_MERCHANT_CHECKSUM_KEY] })

initializeApp()
const db = getFirestore()

/**
 * Bonum gateway credentials live in the functions config / env — never in the client code:
 *   firebase functions:secrets:set BONUM_APP_SECRET
 *   firebase functions:secrets:set BONUM_TERMINAL_ID
 *   firebase functions:secrets:set BONUM_MERCHANT_CHECKSUM_KEY   (webhook checksum)
 *
 * The base URL switches the environment:
 *   https://testapi.bonum.mn — test
 *   https://apis.bonum.mn    — production
 */
const BASE_URL = process.env.BONUM_BASE_URL ?? 'https://testapi.bonum.mn'

function bonumClient(): BonumGatewayClient {
  const appSecret = process.env.BONUM_APP_SECRET
  const terminalId = process.env.BONUM_TERMINAL_ID
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

/** The site URL the webhook needs to verify and report against. */
const SITE_URL = process.env.SITE_URL ?? 'https://duukhee.web.app'

/**
 * Creates a Bonum invoice for an existing order and opens the payment window.
 * The amount always comes from the Firestore order, never from the client.
 */
export const createBonumInvoice = onCall(async (request) => {
  const orderId = String(request.data?.orderId ?? '')
  const amount = Number(request.data?.amount ?? 0)

  const orderRef = db.doc(`orders/${orderId}`)
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

  const callbackUrl = `${process.env.SITE_URL ?? SITE_URL}/api/bonum/webhook`
  let invoice
  try {
    invoice = await bonumClient().createInvoice({
      amount: invoiceAmount,
      transactionId: orderId,
      callback: callbackUrl,
    })
  } catch {
    throw new HttpsError('internal', 'Төлбөрийн системтэй холбогдож чадсангүй. Арай хожим дахин оролдоно уу.')
  }

  await orderRef.update({
    'payment.provider': 'bonum',
    'payment.reference': invoice.invoiceId,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { invoiceId: invoice.invoiceId, payUrl: invoice.followUpLink }
})

/**
 * Bonum posts the payment result here. The checksum header is verified with the
 * merchant checksum key; then the order is marked paid / failed.
 */
export const bonumWebhook = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.set('Allow', 'POST').sendStatus(405)
    return
  }

  const checksumKey = process.env.BONUM_MERCHANT_CHECKSUM_KEY
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})
  const header = req.header('x-checksum-v2') ?? ''

  if (checksumKey && !verifyWebhookChecksum(rawBody, header, checksumKey)) {
    res.sendStatus(401)
    return
  }

  const event = parseWebhookEvent(rawBody)
  const orderId = String((event as { transactionId?: string })?.transactionId ?? '')
  const ok = (event as { status?: string })?.status === 'SUCCESS'

  if (!orderId) {
    res.sendStatus(400)
    return
  }

  const orderRef = db.doc(`orders/${orderId}`)
  const orderSnap = await orderRef.get()
  if (!orderSnap.exists) {
    res.sendStatus(404)
    return
  }

  if (ok) {
    // Same stock logic as the admin's updateOrderStatus: moving into paid takes items out of stock.
    await db.runTransaction(async (tx) => {
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
        db.doc(`products/${id}`),
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
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } else {
    await orderRef.update({
      'payment.status': 'failed',
      updatedAt: FieldValue.serverTimestamp(),
    })
  }

  res.sendStatus(200)
})
