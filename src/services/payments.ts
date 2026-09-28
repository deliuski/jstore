import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from '../lib/firebase'

const functions = getFunctions()

/** What the `createBonumInvoice` Cloud Function returns on success. */
export interface BonumInvoice {
  /** Bonum invoice id — stored on the order as payment.reference. */
  invoiceId: string
  /** Where to send the payer (Bonum's hosted payment window). */
  payUrl: string
}

/** What the `createBonumInvoice` Cloud Function receives. */
export interface CreateInvoiceInput {
  orderId: string
  amount: number
  description: string
  /** Where Bonum sends the payer back after paying (e.g. /order/success). */
  returnUrl: string
}

/**
 * Asks the backend to create a Bonum invoice for the order.
 * Throws when Bonum rejects the request (message is already in Mongolian).
 */
export async function createBonumInvoice(input: CreateInvoiceInput): Promise<BonumInvoice> {
  const call = httpsCallable<CreateInvoiceInput, BonumInvoice>(functions, 'createBonumInvoice')
  const result = await call(input)
  return result.data
}

/**
 * Marks the order as awaiting payment before opening the Bonum window, so the
 * order list shows «Төлбөр хүлээгдэж буй» while the payer is on Bonum's page.
 */
export async function markOrderAwaitingPayment(orderId: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status: 'awaiting_payment', updatedAt: serverTimestamp() })
}
