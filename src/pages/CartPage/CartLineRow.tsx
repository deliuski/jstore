import { Link } from 'react-router'
import { CloseIcon, MinusIcon, PlusIcon } from '../../components/icons'
import { ProductImage } from '../../components/ProductImage/ProductImage'
import { cx } from '../../lib/cx'
import { formatPrice } from '../../lib/format'
import { productPath, type CartLine } from './cartLines'
import { WarningIcon } from './WarningIcon'
import s from './CartLineRow.module.css'

interface CartLineRowProps {
  line: CartLine
  /** 0 removes the line. */
  onQtyChange: (qty: number) => void
}

export function CartLineRow({ line, onQtyChange }: CartLineRowProps) {
  const { product, size, qty, maxQty, issue } = line
  const name = product?.name ?? 'Худалдаанд байхгүй бараа'
  const label = size ? `${name}, EU ${size}` : name
  const lineTotal = product?.price == null ? null : product.price * qty

  return (
    <li className={cx(s.line, issue && s.blocked)}>
      {product ? (
        <Link to={productPath(line)} className={s.thumb} tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} className={s.image} />
        </Link>
      ) : (
        <div className={cx(s.thumb, s.thumbEmpty)} aria-hidden="true" />
      )}

      <div className={s.info}>
        {product ? (
          <Link to={productPath(line)} className={s.name}>
            {name}
          </Link>
        ) : (
          <span className={s.name}>{name}</span>
        )}
        {product && (
          <span className={s.meta}>
            {size && <span className={s.size}>EU {size}</span>}
            {formatPrice(product.price)}
          </span>
        )}
        {product?.status === 'soon' && <span className={s.preorder}>Урьдчилсан захиалга</span>}
        {issue && (
          <p className={s.issue}>
            <WarningIcon />
            {issue}
          </p>
        )}
      </div>

      {product && maxQty > 0 && (
        <div className={s.controls}>
          <QtyStepper qty={qty} max={maxQty} label={label} onChange={onQtyChange} />
          <span className={s.total}>{formatPrice(lineTotal)}</span>
        </div>
      )}

      <button type="button" className={s.remove} aria-label={`${label} — сагснаас хасах`} onClick={() => onQtyChange(0)}>
        <CloseIcon size={20} />
      </button>
    </li>
  )
}

interface QtyStepperProps {
  qty: number
  max: number
  label: string
  onChange: (qty: number) => void
}

function QtyStepper({ qty, max, label, onChange }: QtyStepperProps) {
  return (
    <div className={s.stepper} role="group" aria-label={`${label} — тоо ширхэг`}>
      <button
        type="button"
        className={s.step}
        aria-label="Нэгээр хасах"
        disabled={qty <= 1}
        onClick={() => onChange(qty - 1)}
      >
        <MinusIcon size={16} strokeWidth={2} />
      </button>
      <span className={s.qty} aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        className={s.step}
        aria-label="Нэгээр нэмэх"
        disabled={qty >= max}
        onClick={() => onChange(qty + 1)}
      >
        <PlusIcon size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
