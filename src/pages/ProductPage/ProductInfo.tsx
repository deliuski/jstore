import { useState } from 'react'
import { MinusIcon, PlusIcon } from '../../components/icons'
import { PRODUCT_INFO_SECTIONS } from '../../data/site'
import s from './ProductInfo.module.css'

/** Description / delivery / payment / returns accordion — one section open at a time. */
export function ProductInfo({ description }: { description?: string }) {
  const [openId, setOpenId] = useState<string | null>('desc')

  return (
    <div className={s.accordion}>
      {PRODUCT_INFO_SECTIONS.map((section) => {
        const open = section.id === openId
        const panelId = `product-info-${section.id}`
        const body = section.id === 'desc' && description ? description : section.body

        return (
          <div key={section.id} className={s.item}>
            <button
              type="button"
              className={s.toggle}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : section.id)}
            >
              <span className={s.title}>{section.title}</span>
              {open ? <MinusIcon size={20} strokeWidth={2} /> : <PlusIcon size={20} strokeWidth={2} />}
            </button>
            <p id={panelId} className={s.body} hidden={!open}>
              {body}
            </p>
          </div>
        )
      })}
    </div>
  )
}
