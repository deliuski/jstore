import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { orderFromDoc } from '../services/orders'
import type { Order } from '../models/order'

/**
 * Realtime copy of one order — the success page watches its payment status.
 * Kept outside the shared `useLive` cache because orders are admin-only in
 * Firestore; this direct listener is for the order the customer just placed.
 */
export function useOrder(id: string | undefined): { data: Order | null | undefined; loading: boolean; error: Error | null } {
  const key = id ?? null
  const [state, setState] = useState<{ data: Order | null | undefined; loading: boolean; error: Error | null }>({
    data: undefined,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!id) return
    const unsubscribe = onSnapshot(
      doc(db, 'orders', id),
      (snap) => {
        setState({ data: snap.exists() ? orderFromDoc(snap.id, snap.data()) : null, loading: false, error: null })
      },
      (error) => {
        setState({ data: undefined, loading: false, error })
      },
    )
    return unsubscribe
  }, [id])

  return key === null ? { data: undefined, loading: true, error: null } : state
}
