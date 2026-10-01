import { useState, type FormEvent } from 'react'
import { Fragment } from 'react'
import { Link } from 'react-router'
import { FOOTER_GROUPS, PAYMENT_METHODS, WEBSITE_CREDIT } from '../../data/site'
import { useStoreSettings } from '../../hooks/data'
import { cx } from '../../lib/cx'
import { FacebookIcon, InstagramIcon } from '../icons'
import { Logo } from '../Logo/Logo'
import { isValidEmail, saveEmailSubscriber } from '../../services/emailSubscribers'
import s from './Footer.module.css'

export function Footer() {
  const store = useStoreSettings()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = email.trim()
    if (!isValidEmail(trimmed)) {
      setMessage('Зөв имэйл оруулна уу')
      return
    }

    setSubscribing(true)
    setMessage(null)
    try {
      await saveEmailSubscriber(trimmed, 'site-footer', 'Сайтын доод хэсэг')
      setEmail('')
      setMessage('Имэйл бүртгэгдлээ. Шинэ барааны мэдэгдэл илгээнэ.')
    } catch {
      setMessage('Бүртгэж чадсангүй. Дахин оролдоно уу.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer id="footer" className={s.footer}>
      <div className={s.inner}>
        <div className={s.columns}>
          <div className={s.brand}>
            <Logo />
            <div className={s.brandInfo}>
              <span className={s.storeName}>{store.name}</span>
              <span className={s.text}>
                {store.addressLines.map((line, index) => (
                  <Fragment key={line}>
                    {index > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </span>
              <span className={s.contactTitle}>Холбоо барих</span>
              <span className={s.text}>
                {`Утас: ${store.phone}`}
                <br />
                {store.hours}
              </span>
            </div>

            <form className={s.subscribe} onSubmit={submit} noValidate>
              <label className={s.subscribeLabel} htmlFor="footer-email">
                Шинэ барааны мэдэгдэл авах
              </label>
              <div className={s.subscribeRow}>
                <input
                  id="footer-email"
                  type="email"
                  className={s.subscribeInput}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <button type="submit" className={s.subscribeButton} disabled={subscribing}>
                  {subscribing ? '...' : 'Бүртгүүлэх'}
                </button>
              </div>
              <p className={s.subscribeMessage} aria-live="polite">
                {message ?? 'Имэйлээ үлдээгээд шинэ бараа ирэхэд түрүүлж мэдээрэй.'}
              </p>
            </form>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} className={s.group} aria-label={group.title}>
              <span className={s.groupTitle}>{group.title}</span>
              {group.links.map((link) => (
                <Link key={link.label} to={link.to} className={cx(s.groupLink, link.desktopOnly && s.desktopOnly)}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className={s.bottom}>
          <div className={s.divider} />
          <div className={s.bottomRow}>
            <ul className={s.payments} aria-label="Төлбөрийн хэрэгсэл">
              {PAYMENT_METHODS.map((method) => (
                <li key={method.label} className={cx(s.payment, method.desktopOnly && s.desktopOnly)}>
                  {method.label}
                </li>
              ))}
            </ul>
            <div className={s.socials}>
              <a href={store.facebookUrl} className={s.social} aria-label="Facebook">
                <FacebookIcon className={s.socialIcon} />
              </a>
              <a href={store.instagramUrl} className={s.social} aria-label="Instagram">
                <InstagramIcon className={s.socialIcon} />
              </a>
            </div>
            <span className={s.credit}>{WEBSITE_CREDIT}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
