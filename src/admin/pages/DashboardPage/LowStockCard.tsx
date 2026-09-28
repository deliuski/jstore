import { useState } from 'react'
import { PlusIcon } from '../../../components/icons'
import { lowStockEntries, type LowStockEntry, type Product } from '../../../models/product'
import { adjustStock } from '../../../services/products'
import { Card } from '../../components/Card/Card'
import { ProductThumb } from '../../components/ProductThumb/ProductThumb'
import { useToast } from '../../components/Toast/toast'
import { stockLabel } from './dashboard'
import s from './LowStockCard.module.css'

const ROWS = 5

const entryKey = (entry: LowStockEntry) => `${entry.product.id}:${entry.size ?? ''}`

/** "Дуусаж буй размер": the sizes closest to selling out, each with a quick "+1" restock. */
export function LowStockCard({ products }: { products: Product[] }) {
  const toast = useToast()
  const [pending, setPending] = useState<string | null>(null)
  const entries = lowStockEntries(products).slice(0, ROWS)

  const addOne = async (entry: LowStockEntry) => {
    const what = entry.size === null ? entry.product.name : `${entry.product.name} · EU ${entry.size}`
    setPending(entryKey(entry))
    try {
      await adjustStock(entry.product.id, entry.size, 1)
      toast(`${what}: нөөц ${entry.stock + 1} боллоо`)
    } catch {
      toast(`${what}: нөөц нэмж чадсангүй`, 'error')
    } finally {
      setPending(null)
    }
  }

  return (
    <Card title="Дуусаж буй размер" titleClassName={s.title} action={{ label: 'Бүгд', to: '/admin/inventory' }}>
      {entries.length === 0 ? (
        <p className={s.empty}>Дуусаж буй размер алга.</p>
      ) : (
        <ul className={s.list}>
          {entries.map((entry) => (
            <li key={entryKey(entry)} className={s.row}>
              <ProductThumb item={entry.product} size={40} />
              <div className={s.info}>
                <p className={s.name} title={entry.product.name}>
                  {entry.product.name}
                </p>
                <p className={s.stock}>{stockLabel(entry)}</p>
              </div>
              <button
                type="button"
                className={s.add}
                aria-label={`${entry.product.name}${entry.size ? `, EU ${entry.size}` : ''}: нөөцийг 1-ээр нэмэх`}
                disabled={pending === entryKey(entry)}
                onClick={() => addOne(entry)}
              >
                <PlusIcon size={16} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
