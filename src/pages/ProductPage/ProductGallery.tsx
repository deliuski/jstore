import { useState } from 'react'
import { Badge } from '../../components/Badge/Badge'
import { ProductImage } from '../../components/ProductImage/ProductImage'
import { getProductTag, type Product } from '../../models/product'
import { cx } from '../../lib/cx'
import s from './ProductGallery.module.css'

// The main photo is the side view; missing angles show the design's placeholders.
const ANGLE_LABELS = ['Хажуу тал', 'Урд тал', 'Ар тал', 'Ул']

export function ProductGallery({ product }: { product: Product }) {
  const photos = [product.image, ...product.gallery].filter((src): src is string => Boolean(src))
  const views = Array.from({ length: Math.max(ANGLE_LABELS.length, photos.length) }, (_, index) => ({
    label: ANGLE_LABELS[index] ?? `Зураг ${index + 1}`,
    src: photos[index],
  }))
  const [activeIndex, setActiveIndex] = useState(0)
  const active = views[activeIndex]
  // Full photos (with their own background) fill the frame instead of floating on white.
  const cover = product.imageFit === 'cover'
  const tag = getProductTag(product)

  return (
    <div className={s.gallery}>
      <div className={s.stage}>
        {active.src ? (
          <img
            className={cx(s.stageImage, cover && s.stageImageCover)}
            src={active.src}
            alt={`${product.name} — ${active.label}`}
          />
        ) : (
          <ProductImage product={product} className={s.stagePlaceholder} />
        )}
        {tag && <Badge tag={tag} className={s.badge} />}
      </div>

      <div className={s.thumbs}>
        {views.map((view, index) => (
          <button
            key={view.label}
            type="button"
            className={cx(s.thumb, index === activeIndex && s.thumbActive, cover && view.src && s.thumbCover)}
            aria-label={view.label}
            aria-pressed={index === activeIndex}
            disabled={!view.src}
            onClick={() => setActiveIndex(index)}
          >
            {view.src ? (
              <img className={cx(s.thumbImage, cover && s.thumbImageCover)} src={view.src} alt="" />
            ) : (
              `[${view.label}]`
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
