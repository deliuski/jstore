import { collection, onSnapshot, orderBy, query, type DocumentData } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app, db } from '../lib/firebase'
import { toDate, toString } from './convert'
import type { EmailSubscriber } from '../models/email'

const subscribersCol = collection(db, 'emailSubscribers')
const functions = getFunctions(app, 'us-central1')

interface SendAnnouncementInput {
  subject: string
  body: string
}

interface SendAnnouncementResult {
  recipientCount: number
}

interface SubscribeEmailInput {
  email: string
  productId: string
  productName: string
}

interface SubscribeEmailResult {
  ok: boolean
}

const sendAnnouncementCallable = httpsCallable<SendAnnouncementInput, SendAnnouncementResult>(
  functions,
  'sendSubscriberAnnouncement',
)

const subscribeEmailCallable = httpsCallable<SubscribeEmailInput, SubscribeEmailResult>(functions, 'subscribeEmailSubscriber')

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function subscriberFromDoc(id: string, data: DocumentData): EmailSubscriber {
  return {
    id,
    email: toString(data.email),
    productId: toString(data.productId),
    productName: toString(data.productName),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

/** Admin list of all captured notification emails, newest activity first. */
export function subscribeEmailSubscribers(next: (subscribers: EmailSubscriber[]) => void, fail: (error: Error) => void) {
  return onSnapshot(
    query(subscribersCol, orderBy('updatedAt', 'desc')),
    (snapshot) => next(snapshot.docs.map((d) => subscriberFromDoc(d.id, d.data()))),
    fail,
  )
}

/** Stores or updates a subscriber by email. */
export async function saveEmailSubscriber(email: string, productId: string, productName: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email)
  await subscribeEmailCallable({ email: normalizedEmail, productId, productName })
}

export function isValidEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim())
}

export async function sendSubscriberAnnouncement(subject: string, body: string): Promise<number> {
  const result = await sendAnnouncementCallable({ subject: subject.trim(), body: body.trim() })
  return Number((result.data as SendAnnouncementResult | undefined)?.recipientCount ?? 0)
}
