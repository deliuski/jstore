import { Link } from 'react-router'
import { cx } from '../../../lib/cx'
import { formatPrice } from '../../../lib/format'
import { CATEGORY_LABELS, LOW_STOCK_THRESHOLD, isSoldOut, totalStock, type Product } from '../../../models/product'
import t from '../../components/DataTable/DataTable.module.css'
import { Pill } from '../../components/Pill/Pill'
import { ProductStatusPill } from '../../components/Pill/ProductStatusPill'
import { ProductThumb } from '../../components/ProductThumb/ProductThumb'
import { PencilIcon, StarIcon, TrashIcon } from './icons'
import s from './ProductsTable.module.css'

interface ProductsTableProps {
  products: Product[]
  onDelete: (product: Product) => void
}

/** The product list: a table on wider screens, one card per product on phones. */
export function ProductsTable({ products, onDelete }: ProductsTableProps) {
  return (
    <div className={t.scroller}>
      <table className={cx(t.table, s.table)}>
        <thead>
          <tr>
            <th scope="col">Бараа</th>
            <th scope="col" className={s.category}>
              Ангилал
            </th>
            <th scope="col">Үнэ</th>
            <th scope="col" className={t.right}>
              Нөөц
            </th>
            <th scope="col">Төлөв</th>
            <th scope="col" className={cx(t.fit, s.featured)}>
              Нүүр
            </th>
            <th scope="col" className={t.fit}>
              <span className="visually-hidden">Үйлдэл</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const name = product.name || 'Нэргүй бараа'
            const editPath = `/admin/products/${product.id}`
            const total = totalStock(product)
            return (
              <tr key={product.id} className={cx(t.clickable, s.row)}>
                <td className={s.productCell}>
                  <span className={s.product}>
                    <ProductThumb item={product} />
                    <span className={s.productText}>
                      <Link to={editPath} className={cx(t.rowLink, s.name)}>
                        {name}
                      </Link>
                      <span className={s.meta}>
                        <span className={s.metaCategory}>{CATEGORY_LABELS[product.category]} · </span>
                        {product.sku || 'SKU алга'}
                      </span>
                    </span>
                  </span>
                </td>
                <td className={cx(t.muted, t.nowrap, s.category)}>{CATEGORY_LABELS[product.category]}</td>
                <td className={s.price}>
                  <span className={s.priceValue}>{formatPrice(product.price)}</span>
                  {product.onSale && (
                    <span className={s.sale}>
                      <Pill tone="red" className={s.salePill}>
                        Хямдрал
                      </Pill>
                      {product.oldPrice !== null && <s className={s.oldPrice}>{formatPrice(product.oldPrice)}</s>}
                    </span>
                  )}
                </td>
                <td className={cx(t.right, s.stock)}>
                  <span className={s.stockLabel}>Нөөц </span>
                  {isSoldOut(product) ? (
                    <span className={s.soldOut}>Дууссан</span>
                  ) : (
                    // A "coming soon" item with no stock yet is expected, so its 0 stays neutral.
                    <span className={cx(t.num, total === 0 ? t.muted : total <= LOW_STOCK_THRESHOLD && s.low)}>
                      {total}
                    </span>
                  )}
                </td>
                <td className={s.status}>
                  <ProductStatusPill status={product.status} />
                </td>
                <td className={s.featured}>
                  {product.featured && (
                    <span className={s.star} title="Нүүр хуудсанд харагдана">
                      <StarIcon size={18} fill="currentColor" strokeWidth={1.2} />
                      <span className="visually-hidden">Нүүр хуудсанд харагдана</span>
                    </span>
                  )}
                </td>
                <td className={s.actions}>
                  <Link to={editPath} className={s.iconButton} aria-label={`${name}: засах`} title="Засах">
                    <PencilIcon />
                  </Link>
                  <button
                    type="button"
                    className={cx(s.iconButton, s.delete)}
                    aria-label={`${name}: устгах`}
                    title="Устгах"
                    onClick={() => onDelete(product)}
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
