import { useEffect, useState } from 'react'
import { PAYMENT_METHOD_SHORT, orderItemCount, type Order, type PaymentMethod } from '../../../models/order'
import type { LowStockEntry } from '../../../models/product'

const WEEKDAYS = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба']

/** 3 → "03" */
export function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** "2026.09.25 · Баасан" */
export function formatDashboardDate(date: Date): string {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} · ${WEEKDAYS[date.getDay()]}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// Order of the payment methods in the "new orders" summary, as in the design.
const SUMMARY_METHODS: PaymentMethod[] = ['bonum']

/** "QPay 9 · Данс 2 · SocialPay 1" — new orders per payment method (methods with none are left out). */
export function paymentSummary(orders: Order[]): string {
  return SUMMARY_METHODS.map((method) => [method, orders.filter((order) => order.payment.method === method).length] as const)
    .filter(([, count]) => count > 0)
    .map(([method, count]) => `${PAYMENT_METHOD_SHORT[method]} ${count}`)
    .join(' · ')
}

/** Pairs booked for the next shipment (every pre-order that is not cancelled). */
export function preorderPairs(orders: Order[]): number {
  return orders
    .filter((order) => order.preorder && order.status !== 'cancelled')
    .reduce((sum, order) => sum + orderItemCount(order), 0)
}

/** Whole days and hours left until `target` (never negative); `null` when no date is set. */
export function countdown(target: Date | null, now: Date): { days: number; hours: number } | null {
  if (!target) return null
  const hoursLeft = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 3_600_000))
  return { days: Math.floor(hoursLeft / 24), hours: hoursLeft % 24 }
}

/** "EU 42 · 1 үлдсэн", or "1 үлдсэн" for one-size items. */
export function stockLabel(entry: LowStockEntry): string {
  const left = `${entry.stock} үлдсэн`
  return entry.size === null ? left : `EU ${entry.size} · ${left}`
}

/** The current time, refreshed every `intervalMs` (for the date and the shipment countdown). */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}
