import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons'
import { ANNOUNCEMENTS } from '../../data/site'
import s from './AnnouncementBar.module.css'

export function AnnouncementBar() {
  const [index, setIndex] = useState(0)
  const count = ANNOUNCEMENTS.length
  const announcement = ANNOUNCEMENTS[index]
  const goTo = (next: number) => setIndex((next + count) % count)

  return (
    <div className={s.bar}>
      <div className={s.inner}>
        <button type="button" className={s.arrow} aria-label="Өмнөх мэдээ" onClick={() => goTo(index - 1)}>
          <ChevronLeftIcon size={22} strokeWidth={2.4} />
        </button>
        <div className={s.message} aria-live="polite">
          <span className={s.text}>{announcement.text}</span>
          <a href={announcement.href} className={s.link}>
            {announcement.linkLabel}
          </a>
        </div>
        <button type="button" className={s.arrow} aria-label="Дараах мэдээ" onClick={() => goTo(index + 1)}>
          <ChevronRightIcon size={22} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
