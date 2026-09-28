import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { CheckIcon } from '../../components/icons'
import { PageLoader } from '../../components/PageStatus/PageStatus'
import { BRAND, CATALOG_PATH } from '../../data/site'
import { useOrder } from '../../hooks/order'
import { useShipment, useStoreSettings } from '../../hooks/data'
import { formatPrice } from '../../lib/format'
import { PAYMENT_METHOD_LABELS } from '../../models/order'
import { formatDay, readOrderSuccessState } from './orderSuccess'
import s from './OrderSuccessPage.module.css'

export function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderParam = searchParams.get('order')
  const payFailed = searchParams.get('pay') === 'failed'
  const order = readOrderSuccessState(useLocation().state)
  const number = orderParam ? Number(orderParam) : order?.number

  return <OrderPlaced key={number ?? 'none'} number={number} payFailed={payFailed} />
}

function OrderPlaced({ number, payFailed }: { number: number | undefined; payFailed: boolean }) {
  const store = useStoreSettings()
  const order = useOrder(number === undefined ? undefined : String(number))

  if (number === undefined || !Number.isInteger(number) || number <= 0) {
    return <NoOrder text="Энэ хуудас захиалга өгсний дараа харагдана. Хэрэв та саяхан захиалга өгсөн бол бид удахгүй утсаар холбогдоно." />
  }
  if (order.loading) return <PageLoader />
  if (order.error) return <NoOrder text="Захиалгын мэдээллийг ачаалж чадсангүй. Хуудсаа дахин ачаална уу." />

  const data = order.data

  return (
    <section className={s.page} aria-labelledby="success-title">
      <title>{`Захиалга #${number} — ${BRAND.name}`}</title>

      <span className={s.badge} aria-hidden="true">
        <CheckIcon size={40} strokeWidth={2.2} />
      </span>
      <h1 id="success-title" className={s.title}>
        Захиалга <span className={s.number}>#{number}</span> бүртгэгдлээ
      </h1>

      {data === undefined || data === null ? (
        <>
          <p className={s.lead}>Баярлалаа! Таны захиалгыг бүртгэж байна…</p>
          <PageLoader />
        </>
      ) : (
        <>
          <p className={s.lead}>
            {payFailed
              ? 'Төлбөрийн цонх нээгдсэнгүй — доорх «Төлбөр төлөх» товчоор дахин оролдоно уу.'
              : 'Баярлалаа! Төлбөрийг Bonum төлбөрийн цонхонд хийнэ үү.'}
          </p>

          <dl className={s.facts}>
            <div className={s.fact}>
              <dt>Захиалгын дугаар</dt>
              <dd>#{data.number}</dd>
            </div>
            <div className={s.fact}>
              <dt>Төлбөр</dt>
              <dd>{PAYMENT_METHOD_LABELS[data.payment.method]}</dd>
            </div>
            <div className={s.fact}>
              <dt>Дүн</dt>
              <dd>{formatPrice(data.subtotal)}</dd>
            </div>
          </dl>

          <div className={s.next}>
            <h2 className={s.nextTitle}>Төлбөр</h2>
            {data.payment.status === 'paid' ? (
              <p className={s.text}>Төлбөр төлөгдсөн — баяр хүргэе! Захиалга баталгаажлаа.</p>
            ) : data.payment.status === 'failed' ? (
              <>
                <p className={s.text}>Төлбөр амжилтгүй боллоо. Дахин оролдоно уу эсвэл дэлгүүрт холбогдоно уу.</p>
                <div className={s.actions}>
                  <RetryPayButton number={data.number} subtotal={data.subtotal} />
                </div>
              </>
            ) : (
              <>
                <p className={s.text}>
                  {data.payment.reference
                    ? 'Төлбөрийн цонх хаагдсан бол доорх товчоор дахин нээж төлнө үү.'
                    : 'Доорх товчийг дарж Bonum төлбөрийн цонхонд шилжинэ үү.'}
                </p>
                <div className={s.actions}>
                  <RetryPayButton number={data.number} subtotal={data.subtotal} />
                </div>
              </>
            )}
            {data.preorder && <PreorderNote />}
          </div>

          <p className={s.help}>
            Асуух зүйл байвал{' '}
            <a href={`tel:${store.phone.replace(/\s/g, '')}`} className={s.phone}>
              {store.phone}
            </a>{' '}
            утсаар холбогдоно уу.
          </p>

          <div className={s.actions}>
            <Link to={CATALOG_PATH} className={s.primary}>
              ДЭЛГҮҮР ҮРГЭЛЖЛҮҮЛЭХ
            </Link>
            <Link to="/" className={s.secondary}>
              НҮҮР ХУУДАС
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

/** Creates a fresh Bonum invoice for this order and redirects to Bonum's payment window. */
function RetryPayButton({ number, subtotal }: { number: number; subtotal: number | null }) {
  const [state, setState] = useState<{ busy: boolean; failed: boolean }>({ busy: false, failed: false })

  const open = async () => {
    setState({ busy: true, failed: false })
    try {
      const { createBonumInvoice } = await import('../../services/payments')
      const invoice = await createBonumInvoice({
        orderId: String(number),
        amount: subtotal ?? 0,
        description: `Захиалга #${number} — ${BRAND.name}`,
        returnUrl: `${window.location.origin}/order/success?order=${number}`,
      })
      window.location.assign(invoice.payUrl)
    } catch {
      setState({ busy: false, failed: true })
    }
  }

  return (
    <>
      <button type="button" className={s.primary} onClick={open} disabled={state.busy}>
        {state.busy ? 'НЕЭЖ БАЙНА…' : 'ТӨЛБӨР ТӨЛӨХ'}
      </button>
      {state.failed && <p className={s.text}>Төлбөрийн цонхыг нээж чадсангүй — арай хожим дахин оролдоно уу.</p>}
    </>
  )
}

function PreorderNote() {
  // Read once on mount: an arrival date already in the past is not worth mentioning.
  const [now] = useState(() => Date.now())
  const { settings } = useShipment()
  const arrival = settings.arrivalAt && settings.arrivalAt.getTime() > now ? settings.arrivalAt : null
  if (!arrival) return null
  return (
    <p className={s.preorder}>
      <strong>Урьдчилсан захиалга.</strong> Бараа дараагийн ачаагаар ирэхэд бид тантай холбогдоно.
      {` Ачаа ${formatDay(arrival)}-ны орчим ирэх төлөвтэй.`}
    </p>
  )
}

/** Direct visit without ?order= or with an unknown order number. */
function NoOrder({ text }: { text: string }) {
  return (
    <section className={s.page} aria-labelledby="success-title">
      <title>{`Захиалга — ${BRAND.name}`}</title>
      <h1 id="success-title" className={s.title}>
        Захиалгын мэдээлэл алга
      </h1>
      <p className={s.lead}>{text}</p>
      <div className={s.actions}>
        <Link to="/" className={s.primary}>
          НҮҮР ХУУДАС РУУ БУЦАХ
        </Link>
        <Link to={CATALOG_PATH} className={s.secondary}>
          БҮХ БАРААГ ҮЗЭХ
        </Link>
      </div>
    </section>
  )
}
