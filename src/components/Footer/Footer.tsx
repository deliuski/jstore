import { Fragment } from 'react'
import { Link } from 'react-router'
import { FOOTER_GROUPS, PAYMENT_METHODS, WEBSITE_CREDIT } from '../../data/site'
import { useStoreSettings } from '../../hooks/data'
import { cx } from '../../lib/cx'
import { FacebookIcon, InstagramIcon } from '../icons'
import { Logo } from '../Logo/Logo'
import s from './Footer.module.css'

export function Footer() {
  const store = useStoreSettings()

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
