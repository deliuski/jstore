import { Link } from 'react-router'
import { ChatIcon, FacebookIcon, InstagramIcon } from '../../components/icons'
import { StoreMap } from '../../components/StoreMap/StoreMap'
import { BRAND } from '../../data/site'
import { useStoreSettings } from '../../hooks/data'
import { cx } from '../../lib/cx'
import { directionsUrl } from '../../models/settings'
import s from './LocationPage.module.css'

const NEW_TAB_HINT_ID = 'location-new-tab-hint'
const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer', 'aria-describedby': NEW_TAB_HINT_ID } as const

/** "9996 1353" → "tel:99961353" */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function LocationPage() {
  const store = useStoreSettings()
  const socials = [
    { label: 'Facebook', href: store.facebookUrl, Icon: FacebookIcon },
    { label: 'Instagram', href: store.instagramUrl, Icon: InstagramIcon },
  ]

  return (
    <>
      <title>{`Дэлгүүрийн байршил — ${BRAND.name}`}</title>

      <nav className={s.breadcrumb} aria-label="Талх мөр">
        <ol className={s.crumbs}>
          <li>
            <Link to="/" className={s.crumbLink}>
              Нүүр
            </Link>
          </li>
          <li className={s.crumbCurrent} aria-current="page">
            Байршил
          </li>
        </ol>
      </nav>

      <section className={s.main}>
        <div className={s.info}>
          <div className={s.heading}>
            <h1 className={s.title}>Манай дэлгүүр</h1>
            <span className={s.storeName}>{store.name}</span>
          </div>

          <dl className={s.facts}>
            <div className={s.fact}>
              <dt className={s.label}>Хаяг</dt>
              <dd className={s.value}>
                {store.addressLines.map((line) => (
                  <span key={line} className={s.line}>
                    {line}
                  </span>
                ))}
              </dd>
            </div>
            <div className={s.fact}>
              <dt className={s.label}>Цагийн хуваарь</dt>
              <dd className={cx(s.value, s.hours)}>{store.hours}</dd>
            </div>
            <div className={s.fact}>
              <dt className={s.label}>Холбоо барих</dt>
              <dd className={cx(s.value, s.contact)}>
                <a href={telHref(store.phone)} className={s.phone}>
                  {store.phone}
                </a>
                <ul className={s.socials}>
                  {socials.map(({ label, href, Icon }) => (
                    <li key={label}>
                      <a href={href} className={s.social} aria-label={label} {...NEW_TAB}>
                        <Icon size={22} />
                      </a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div className={s.actions}>
            <a href={directionsUrl(store.location)} className={s.directions} {...NEW_TAB}>
              ЧИГЛЭЛ АВАХ
            </a>
            <a href={store.messengerUrl} className={s.messenger} {...NEW_TAB}>
              <ChatIcon size={20} />
              MESSENGER-ЭЭР АСУУХ
            </a>
          </div>
          <p id={NEW_TAB_HINT_ID} hidden>
            Шинэ цонхонд нээгдэнэ
          </p>
        </div>

        {/* Keyed by zoom: StoreMap only follows location changes, so a saved zoom needs a fresh map. */}
        <StoreMap
          key={store.mapZoom}
          className={s.map}
          location={store.location}
          zoom={store.mapZoom}
          label={`${store.name} — газрын зураг`}
        />
      </section>
    </>
  )
}
