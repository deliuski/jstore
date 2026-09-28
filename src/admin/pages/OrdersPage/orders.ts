import { useState } from 'react'
import { NavigationType, useNavigationType } from 'react-router'
import { ORDER_STATUS_FLOW, PAYMENT_METHOD_LABELS, type Order, type OrderStatus, type PaymentMethod } from '../../../models/order'

export const ORDERS_PATH = '/admin/orders'
export const PAGE_SIZE = 25

export type StatusFilter = OrderStatus | 'all'
export type MethodFilter = PaymentMethod | 'all'
export type FilterParam = 'status' | 'method' | 'q' | 'page'

export const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]

export function orderPath(orderId: string): string {
  return `${ORDERS_PATH}/${encodeURIComponent(orderId)}`
}

/** `?status=` → a known status, else 'all'. */
export function parseStatus(value: string | null): StatusFilter {
  return ORDER_STATUS_FLOW.find((status) => status === value) ?? 'all'
}

/** `?method=` → a known payment method, else 'all'. */
export function parseMethod(value: string | null): MethodFilter {
  return PAYMENT_METHODS.find((method) => method === value) ?? 'all'
}

/** `?page=` → a whole number from 1. */
export function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

/** A copy of `params` with `key` set, or removed when `value` is empty. Any filter change goes back to page 1. */
export function withParam(params: URLSearchParams, key: FilterParam, value: string | null): URLSearchParams {
  const next = new URLSearchParams(params)
  if (value) next.set(key, value)
  else next.delete(key)
  if (key !== 'page') next.delete('page')
  return next
}

/**
 * The search box text for a `?q=` value. Typing updates the URL with `replace`, and those URL
 * changes render in a transition, so they must not reset the box (that would drop keystrokes);
 * any other navigation (sidebar link, back button) does.
 */
export function useSearchDraft(urlValue: string): [string, (value: string) => void] {
  const navigationType = useNavigationType()
  const [draft, setDraft] = useState(urlValue)
  const [seen, setSeen] = useState(urlValue)
  if (urlValue !== seen) {
    setSeen(urlValue)
    if (navigationType !== NavigationType.Replace) setDraft(urlValue)
  }
  return [draft, setDraft]
}

/** Order number ("1025" or "#1025"), phone (spaces ignored), customer or product name. */
export function matchesQuery(order: Order, query: string): boolean {
  const text = query.trim().toLowerCase()
  if (!text) return true
  const digits = text.replace(/^#/, '').replace(/[\s-]/g, '')
  if (/^\d+$/.test(digits)) {
    if (String(order.number).includes(digits) || order.customer.phone.replace(/\D/g, '').includes(digits)) return true
  }
  return [order.customer.name, ...order.items.map((item) => item.name)].some((name) =>
    name.toLowerCase().includes(text),
  )
}

/** The order page's back link. OrdersTable passes it as router state, so "back" keeps the list's filters. */
export interface BackLink {
  to: string
  label: string
}

const ORDERS_BACK_LINK: BackLink = { to: ORDERS_PATH, label: 'Захиалга' }

export function backLinkFrom(state: unknown): BackLink {
  const back = (state as { back?: Partial<BackLink> } | null)?.back
  if (typeof back?.to === 'string' && back.to.startsWith('/admin/') && typeof back.label === 'string') {
    return { to: back.to, label: back.label }
  }
  return ORDERS_BACK_LINK
}
