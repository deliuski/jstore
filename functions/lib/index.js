"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bonumWebhook = exports.createBonumInvoice = void 0;
const firebase_functions_1 = require("firebase-functions");
const params_1 = require("firebase-functions/params");
const https_1 = require("firebase-functions/v2/https");
const https_2 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const bonum_1 = require("@mongolian-payment/bonum");
// Declaring the secrets here makes them available as process.env.* inside the
// functions and pins them to every function in this codebase (v2 requirement).
const BONUM_APP_SECRET = (0, params_1.defineSecret)('BONUM_APP_SECRET');
const BONUM_TERMINAL_ID = (0, params_1.defineSecret)('BONUM_TERMINAL_ID');
const BONUM_MERCHANT_CHECKSUM_KEY = (0, params_1.defineSecret)('BONUM_MERCHANT_CHECKSUM_KEY');
(0, firebase_functions_1.setGlobalOptions)({ region: 'us-central1', maxInstances: 10, secrets: [BONUM_APP_SECRET, BONUM_TERMINAL_ID, BONUM_MERCHANT_CHECKSUM_KEY] });
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
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
const BASE_URL = process.env.BONUM_BASE_URL ?? 'https://testapi.bonum.mn';
function bonumClient() {
    const appSecret = process.env.BONUM_APP_SECRET;
    const terminalId = process.env.BONUM_TERMINAL_ID;
    if (!appSecret || !terminalId) {
        throw new https_1.HttpsError('failed-precondition', 'Төлбөрийн систем хараахан холбогдоогүй. Арай хожим дахин оролдоно уу.');
    }
    // One shared client reuses its Bearer token; Bonum rate-limits new auth requests.
    return new bonum_1.BonumGatewayClient({
        baseUrl: BASE_URL,
        appSecret,
        terminalId,
        checksumKey: process.env.BONUM_MERCHANT_CHECKSUM_KEY,
    });
}
/** The site URL the webhook needs to verify and report against. */
const SITE_URL = process.env.SITE_URL ?? 'https://duukhee.web.app';
/**
 * Creates a Bonum invoice for an existing order and opens the payment window.
 * The amount always comes from the Firestore order, never from the client.
 */
exports.createBonumInvoice = (0, https_1.onCall)(async (request) => {
    const orderId = String(request.data?.orderId ?? '');
    const amount = Number(request.data?.amount ?? 0);
    const orderRef = db.doc(`orders/${orderId}`);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Захиалга олдсонгүй');
    }
    const order = orderSnap.data();
    if (order.payment?.status === 'paid') {
        throw new https_1.HttpsError('failed-precondition', 'Энэ захиалга аль хэдийн төлөгдсөн байна');
    }
    // Trust the stored subtotal; fall back to the client amount only when null.
    const invoiceAmount = order.subtotal ?? amount;
    if (!(invoiceAmount > 0)) {
        throw new https_1.HttpsError('failed-precondition', 'Захиалгын дүн тодорхойгүй — дэлгүүртэй холбогдоно уу');
    }
    const callbackUrl = `${process.env.SITE_URL ?? SITE_URL}/api/bonum/webhook`;
    let invoice;
    try {
        invoice = await bonumClient().createInvoice({
            amount: invoiceAmount,
            transactionId: orderId,
            callback: callbackUrl,
        });
    }
    catch {
        throw new https_1.HttpsError('internal', 'Төлбөрийн системтэй холбогдож чадсангүй. Арай хожим дахин оролдоно уу.');
    }
    await orderRef.update({
        'payment.provider': 'bonum',
        'payment.reference': invoice.invoiceId,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { invoiceId: invoice.invoiceId, payUrl: invoice.followUpLink };
});
/**
 * Bonum posts the payment result here. The checksum header is verified with the
 * merchant checksum key; then the order is marked paid / failed.
 */
exports.bonumWebhook = (0, https_2.onRequest)(async (req, res) => {
    if (req.method !== 'POST') {
        res.set('Allow', 'POST').sendStatus(405);
        return;
    }
    const checksumKey = process.env.BONUM_MERCHANT_CHECKSUM_KEY;
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    const header = req.header('x-checksum-v2') ?? '';
    if (checksumKey && !(0, bonum_1.verifyWebhookChecksum)(rawBody, header, checksumKey)) {
        res.sendStatus(401);
        return;
    }
    const event = (0, bonum_1.parseWebhookEvent)(rawBody);
    const orderId = String(event?.transactionId ?? '');
    const ok = event?.status === 'SUCCESS';
    if (!orderId) {
        res.sendStatus(400);
        return;
    }
    const orderRef = db.doc(`orders/${orderId}`);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
        res.sendStatus(404);
        return;
    }
    if (ok) {
        // Same stock logic as the admin's updateOrderStatus: moving into paid takes items out of stock.
        await db.runTransaction(async (tx) => {
            const snap = await tx.get(orderRef);
            if (!snap.exists)
                return;
            const order = snap.data();
            if (order.payment.status === 'paid')
                return;
            const shouldDeduct = order.status !== 'cancelled';
            const deduct = shouldDeduct && !order.stockDeducted;
            const productRefs = [...new Set(order.items.map((item) => item.productId))].map((id) => db.doc(`products/${id}`));
            const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));
            for (const productSnap of productSnaps) {
                if (!productSnap.exists)
                    continue;
                const product = productSnap.data();
                let { stock } = product;
                const sizes = product.sizes.map((size) => ({ ...size }));
                for (const item of order.items) {
                    if (item.productId !== productSnap.id)
                        continue;
                    const change = item.qty * (deduct ? -1 : 0);
                    const size = item.size === null ? undefined : sizes.find((s) => s.label === item.size);
                    if (size)
                        size.stock = Math.max(0, size.stock + change);
                    else
                        stock = Math.max(0, stock + change);
                }
                tx.update(productSnap.ref, { sizes, stock });
            }
            tx.update(orderRef, {
                status: 'paid',
                'payment.status': 'paid',
                stockDeducted: deduct ? true : order.stockDeducted,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
        });
    }
    else {
        await orderRef.update({
            'payment.status': 'failed',
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    res.sendStatus(200);
});
//# sourceMappingURL=index.js.map