import { Link } from 'react-router'
import { BagIcon } from '../../components/icons'
import { PageError, PageLoader } from '../../components/PageStatus/PageStatus'
import { useShop } from '../../context/shop'
import { BRAND, CATALOG_PATH } from '../../data/site'
import { useCatalog } from '../../hooks/data'
import { formatPrice } from '../../lib/format'
import { Breadcrumbs } from './Breadcrumbs'
import { CartLineRow } from './CartLineRow'
import { CART_BLOCKER_ID, CartSummary } from './CartSummary'
import { CheckoutButton } from './CheckoutButton'
import { cartPieces, cartSubtotal, checkoutBlocker, resolveCart, type CartLine } from './cartLines'
import s from './CartPage.module.css'

const CRUMBS = [{ label: 'Нүүр', to: '/' }, { label: 'Сагс' }]

export function CartPage() {
  const { cart } = useShop()
  const catalog = useCatalog()

  if (cart.length === 0) return <EmptyCart />
  if (catalog.loading) return <PageLoader />
  if (!catalog.data) return <PageError />

  return <CartContents lines={resolveCart(cart, catalog.data)} />
}

function CartContents({ lines }: { lines: CartLine[] }) {
  const { setCartQty } = useShop()
  const pieces = cartPieces(lines)
  const subtotal = cartSubtotal(lines)
  const blocker = checkoutBlocker(lines)

  return (
    <>
      <title>{`Сагс (${pieces}) — ${BRAND.name}`}</title>
      <Breadcrumbs items={CRUMBS} />

      <section className={s.page} aria-labelledby="cart-title">
        <h1 id="cart-title" className={s.title}>
          Сагс <span className={s.count}>({pieces})</span>
        </h1>

        <div className={s.layout}>
          <ul className={s.lines} aria-label="Сагсан дахь бараа">
            {lines.map((line) => (
              <CartLineRow
                key={line.key}
                line={line}
                onQtyChange={(qty) => setCartQty(line.productId, line.size, qty)}
              />
            ))}
          </ul>

          <CartSummary pieces={pieces} subtotal={subtotal} blocker={blocker} />

          <div className={s.bottomBar}>
            <span className={s.barTotal}>
              <span className={s.barLabel}>Нийт</span>
              {formatPrice(subtotal)}
            </span>
            <CheckoutButton
              className={s.barButton}
              disabled={blocker !== null}
              describedBy={blocker ? CART_BLOCKER_ID : undefined}
            />
          </div>
        </div>
      </section>
    </>
  )
}

function EmptyCart() {
  return (
    <>
      <title>{`Сагс — ${BRAND.name}`}</title>
      <Breadcrumbs items={CRUMBS} />

      <section className={s.page} aria-labelledby="cart-title">
        <h1 id="cart-title" className={s.title}>
          Сагс
        </h1>
        <div className={s.empty}>
          <BagIcon size={56} strokeWidth={1.2} />
          <p className={s.emptyTitle}>Таны сагс хоосон байна</p>
          <p className={s.emptyText}>Таалагдсан бараагаа сагсанд нэмээд эндээс захиалгаа өгөөрэй.</p>
          <Link to={CATALOG_PATH} className={s.emptyLink}>
            БҮХ БАРААГ ҮЗЭХ
          </Link>
        </div>
      </section>
    </>
  )
}
