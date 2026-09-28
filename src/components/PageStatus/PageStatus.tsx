import s from './PageStatus.module.css'

/** Full-width loading spinner for pages waiting on Firebase. */
export function PageLoader() {
  return (
    <div className={s.box} role="status">
      <span className={s.spinner} aria-hidden="true" />
      <span className="visually-hidden">Ачаалж байна…</span>
    </div>
  )
}

/** Friendly message when data could not be loaded. */
export function PageError({ message = 'Мэдээлэл ачаалж чадсангүй. Хуудсаа дахин ачаална уу.' }: { message?: string }) {
  return (
    <div className={s.box} role="alert">
      <p className={s.message}>{message}</p>
    </div>
  )
}
