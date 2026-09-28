import { Link } from 'react-router'
import { CATALOG_PATH } from '../../data/site'
import { formatPrice } from '../../lib/format'
import { CheckoutButton } from './CheckoutButton'
import { WarningIcon } from './WarningIcon'
import s from './CartSummary.module.css'

export const CART_BLOCKER_ID = 'cart-blocker'

interface CartSummaryProps {
  pieces: number
  subtotal: number | null
  /** Why checkout is disabled, if it is. */
  blocker: string | null
}

export function CartSummary({ pieces, subtotal, blocker }: CartSummaryProps) {
  return (
    <aside className={s.summary} aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title" className={s.title}>
        Захиалгын дүн
      </h2>

      <dl className={s.rows}>
        <div className={s.row}>
          <dt>Бараа ({pieces})</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className={s.row}>
          <dt>Хүргэлт</dt>
          <dd>Дараагийн алхамд</dd>
        </div>
        <div className={s.totalRow}>
          <dt>Нийт</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
      </dl>

      {subtotal === null && (
        <p className={s.note}>Зарим барааны үнэ хараахан тогтоогоогүй — дэлгүүр захиалгыг баталгаажуулахдаа үнийг мэдэгдэнэ.</p>
      )}
      <p className={s.note}>
        Улаанбаатар хот дотор хүргэлттэй. Мөн дэлгүүрээс очиж авах боломжтой. Хүргэлтийн нөхцөлийг захиалга
        баталгаажуулах үед утсаар мэдэгдэнэ.
      </p>

      {blocker && (
        <p id={CART_BLOCKER_ID} className={s.blocker}>
          <WarningIcon />
          {blocker}
        </p>
      )}

      <div className={s.actions}>
        {/* Below 1024px the page's sticky bottom bar carries this button instead. */}
        <CheckoutButton
          className={s.cta}
          disabled={blocker !== null}
          describedBy={blocker ? CART_BLOCKER_ID : undefined}
        />
        <Link to={CATALOG_PATH} className={s.continue}>
          Дэлгүүр үргэлжлүүлэх
        </Link>
      </div>
    </aside>
  )
}
