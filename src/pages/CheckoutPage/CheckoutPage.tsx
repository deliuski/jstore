import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ChevronRightIcon, MapPinIcon } from '../../components/icons'
import { PageError, PageLoader } from '../../components/PageStatus/PageStatus'
import { useShop } from '../../context/shop'
import { BRAND, CART_PATH, LOCATION_PATH } from '../../data/site'
import { useCatalog, useStoreSettings } from '../../hooks/data'
import { cx } from '../../lib/cx'
import {
  DELIVERY_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  UB_DISTRICTS,
  type DeliveryMethod,
  type PaymentMethod,
} from '../../models/order'
import { createBonumInvoice } from '../../services/payments'
import { createOrder } from '../../services/orders'
import { Breadcrumbs } from '../CartPage/Breadcrumbs'
import {
  cartSubtotal,
  checkoutBlocker,
  isPreorder,
  resolveCart,
  toOrderItems,
  type CartLine,
} from '../CartPage/cartLines'
import { WarningIcon } from '../CartPage/WarningIcon'
import { ORDER_SUCCESS_PATH } from '../OrderSuccessPage/orderSuccess'
import {
  CHECKED_FIELDS,
  INITIAL_VALUES,
  MAX_LENGTH,
  normalizePhone,
  validateCheckout,
  type CheckoutValues,
} from './checkoutForm'
import { ChoiceCard } from './ChoiceCard'
import { Field } from './Field'
import { OrderSummary } from './OrderSummary'
import s from './CheckoutPage.module.css'

const CRUMBS = [{ label: 'Нүүр', to: '/' }, { label: 'Сагс', to: CART_PATH }, { label: 'Захиалга' }]
const DELIVERY_OPTIONS: DeliveryMethod[] = ['delivery', 'pickup']
const PAYMENT_OPTIONS: PaymentMethod[] = ['bonum']
const PAYMENT_HINTS: Record<PaymentMethod, string> = {
  bonum: 'QPay, SocialPay болон банкар карт — Bonum төлбөрийн цонхонд',
}
const BLOCKER_ID = 'checkout-blocker'

type TextField = 'name' | 'phone' | 'district' | 'address' | 'note'

export function CheckoutPage() {
  const { cart } = useShop()
  const catalog = useCatalog()
  // Emptying the cart after a successful order must not bounce the visitor to
  // /cart before the navigation to Bonum / the success page lands.
  const [placed, setPlaced] = useState(false)

  if (placed) return <PageLoader />
  if (cart.length === 0) return <Navigate to={CART_PATH} replace />
  if (catalog.loading) return <PageLoader />
  if (!catalog.data) return <PageError />

  return <CheckoutForm lines={resolveCart(cart, catalog.data)} onPlaced={() => setPlaced(true)} />
}

function CheckoutForm({ lines, onPlaced }: { lines: CartLine[]; onPlaced: () => void }) {
  const navigate = useNavigate()
  const { clearCart } = useShop()
  const store = useStoreSettings()
  const [values, setValues] = useState<CheckoutValues>(INITIAL_VALUES)
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const errors = showErrors ? validateCheckout(values) : {}
  const hasErrors = Object.keys(errors).length > 0
  const blocker = checkoutBlocker(lines)

  const set = <K extends keyof CheckoutValues>(key: K, value: CheckoutValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  const bind = (key: TextField) => ({
    value: values[key],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      set(key, event.target.value),
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting || blocker) return

    const found = validateCheckout(values)
    const firstInvalid = CHECKED_FIELDS.find((field) => found[field])
    if (firstInvalid) {
      setShowErrors(true)
      const control = event.currentTarget.elements.namedItem(firstInvalid)
      if (control instanceof HTMLElement) control.focus()
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    const phone = normalizePhone(values.phone)
    const preorder = isPreorder(lines)
    const amount = cartSubtotal(lines)
    try {
      const { number } = await createOrder({
        items: toOrderItems(lines),
        customer: { name: values.name, phone },
        delivery: { method: values.delivery, district: values.district, address: values.address, note: values.note },
        paymentMethod: values.payment,
        preorder,
      })
      onPlaced()
      clearCart()

      // Bonum's hosted window: a full-page redirect; the payer returns to the
      // success page, and the bonumWebhook function confirms the payment.
      try {
        const invoice = await createBonumInvoice({
          orderId: String(number),
          amount: amount ?? 0,
          description: `Захиалга #${number} — ${store.name}`,
          returnUrl: `${window.location.origin}${ORDER_SUCCESS_PATH}?order=${number}`,
        })
        window.location.assign(invoice.payUrl)
      } catch {
        // The order is saved but the payment window did not open.
        navigate(`${ORDER_SUCCESS_PATH}?order=${number}&pay=failed`, { replace: true })
      }
    } catch {
      setSubmitError(
        `Захиалга илгээж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу, эсвэл ${store.phone} утсаар холбогдоно уу.`,
      )
      setSubmitting(false)
    }
  }

  return (
    <>
      <title>{`Захиалга — ${BRAND.name}`}</title>
      <Breadcrumbs items={CRUMBS} />

      <section className={s.page} aria-labelledby="checkout-title">
        <h1 id="checkout-title" className={s.title}>
          Захиалга өгөх
        </h1>

        <form className={s.layout} noValidate onSubmit={handleSubmit}>
          <div className={s.sections}>
            <section className={s.section} aria-labelledby="checkout-contact">
              <h2 id="checkout-contact" className={s.sectionTitle}>
                <span className={s.step}>1</span>
                Холбоо барих
              </h2>
              <div className={s.pair}>
                <Field name="name" label="Нэр" error={errors.name}>
                  {(control) => (
                    <input {...control} {...bind('name')} type="text" autoComplete="name" maxLength={MAX_LENGTH.name} />
                  )}
                </Field>
                <Field name="phone" label="Утас" error={errors.phone}>
                  {(control) => (
                    <input
                      {...control}
                      {...bind('phone')}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="9911 2233"
                    />
                  )}
                </Field>
              </div>
            </section>

            <section className={s.section} aria-labelledby="checkout-delivery">
              <h2 id="checkout-delivery" className={s.sectionTitle}>
                <span className={s.step}>2</span>
                Хүргэлт
              </h2>
              <fieldset className={s.choices}>
                <legend className="visually-hidden">Хүргэлтийн хэлбэр</legend>
                {DELIVERY_OPTIONS.map((method) => (
                  <ChoiceCard
                    key={method}
                    name="delivery"
                    value={method}
                    checked={values.delivery === method}
                    onSelect={() => set('delivery', method)}
                    title={DELIVERY_METHOD_LABELS[method]}
                  >
                    {method === 'delivery' ? 'Улаанбаатар хот дотор' : `Үнэгүй · ${store.addressLines[0] ?? ''}`}
                  </ChoiceCard>
                ))}
              </fieldset>

              {values.delivery === 'delivery' ? (
                <>
                  <Field name="district" label="Дүүрэг" error={errors.district}>
                    {(control) => (
                      <div className={s.selectWrap}>
                        <select {...control} {...bind('district')}>
                          <option value="">Дүүрэг сонгох</option>
                          {UB_DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                        <ChevronRightIcon size={18} className={s.selectIcon} />
                      </div>
                    )}
                  </Field>
                  <Field name="address" label="Хаяг" error={errors.address}>
                    {(control) => (
                      <textarea
                        {...control}
                        {...bind('address')}
                        rows={3}
                        maxLength={MAX_LENGTH.address}
                        autoComplete="street-address"
                        placeholder="Хороо, байр, орц, давхар, тоот"
                      />
                    )}
                  </Field>
                </>
              ) : (
                <div className={s.pickup}>
                  <MapPinIcon size={22} />
                  <div className={s.pickupText}>
                    <p className={s.pickupName}>{store.name}</p>
                    <p>{store.addressLines.join(', ')}</p>
                    <p>{store.hours}</p>
                    <Link to={LOCATION_PATH} className={s.pickupLink}>
                      Газрын зураг дээр харах
                    </Link>
                  </div>
                </div>
              )}

              <Field name="note" label="Нэмэлт тайлбар" optional>
                {(control) => (
                  <textarea
                    {...control}
                    {...bind('note')}
                    rows={3}
                    maxLength={MAX_LENGTH.note}
                    placeholder="Жишээ нь: 18:00 цагаас хойш хүргэж өгөөрэй"
                  />
                )}
              </Field>
            </section>

            <section className={s.section} aria-labelledby="checkout-payment">
              <h2 id="checkout-payment" className={s.sectionTitle}>
                <span className={s.step}>3</span>
                Төлбөр
              </h2>
              <fieldset className={cx(s.choices, s.payments)}>
                <legend className="visually-hidden">Төлбөрийн хэлбэр</legend>
                {PAYMENT_OPTIONS.map((method) => (
                  <ChoiceCard
                    key={method}
                    name="payment"
                    value={method}
                    checked={values.payment === method}
                    onSelect={() => set('payment', method)}
                    title={PAYMENT_METHOD_LABELS[method]}
                  >
                    {PAYMENT_HINTS[method]}
                  </ChoiceCard>
                ))}
              </fieldset>
              <p className={s.hint}>
                «Захиалга өгөх» дараа Bonum төлбөрийн цонх нээгдэнэ — QPay, SocialPay болон банкны картаар
                төлж болно. Төлбөр амжилттай бол захиалга автоматаар баталгаажна.
              </p>
            </section>
          </div>

          <OrderSummary lines={lines} delivery={values.delivery}>
            {blocker && (
              <p id={BLOCKER_ID} className={s.alert} role="alert">
                <WarningIcon />
                <span>
                  {blocker}{' '}
                  <Link to={CART_PATH} className={s.alertLink}>
                    Сагс руу буцах
                  </Link>
                </span>
              </p>
            )}
            {hasErrors && (
              <p className={s.alert}>
                <WarningIcon />
                Улаанаар тэмдэглэсэн талбаруудыг бөглөнө үү.
              </p>
            )}
            {submitError && (
              <p className={s.alert} role="alert">
                <WarningIcon />
                {submitError}
              </p>
            )}
            <button
              type="submit"
              className={s.submit}
              disabled={submitting || blocker !== null}
              aria-describedby={blocker ? BLOCKER_ID : undefined}
            >
              {submitting ? 'ИЛГЭЭЖ БАЙНА…' : 'ЗАХИАЛГА ӨГӨХ'}
            </button>
            <p className={s.after}>Төлбөрийг Bonum-ээр аюулгүй хийнэ — картын мэдээлэл сайтад хадгалагдахгүй.</p>
          </OrderSummary>
        </form>
      </section>
    </>
  )
}
