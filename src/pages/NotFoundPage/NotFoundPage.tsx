import { Link } from 'react-router'
import { BRAND } from '../../data/site'
import s from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <section className={s.page}>
      <title>{`Хуудас олдсонгүй — ${BRAND.name}`}</title>
      <span className={s.code} aria-hidden="true">
        404
      </span>
      <h1 className={s.title}>Хуудас олдсонгүй</h1>
      <Link to="/" className={s.link}>
        НҮҮР ХУУДАС РУУ БУЦАХ
      </Link>
    </section>
  )
}
