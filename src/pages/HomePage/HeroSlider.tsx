import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons'
import { useCatalog } from '../../hooks/data'
import { HERO_SLIDES, heroSlidesFromProducts, type HeroSlide } from '../../data/slides'
import { cx } from '../../lib/cx'
import s from './HeroSlider.module.css'

const SWIPE_THRESHOLD = 50

export function HeroSlider() {
  const catalog = useCatalog()
  // Real products once the catalog loads; the design showcase until then.
  const slides = useMemo(() => {
    const fromCatalog = catalog.data ? heroSlidesFromProducts(catalog.data) : []
    return fromCatalog.length > 0 ? fromCatalog : HERO_SLIDES
  }, [catalog.data])

  return <HeroCarousel slides={slides} />
}

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const swipeStartX = useRef<number | null>(null)
  const count = slides.length
  const slide = slides[Math.min(index, count - 1)]

  const goTo = (next: number) => setIndex((next + count) % count)

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch') swipeStartX.current = event.clientX
  }

  const onPointerUp = (event: PointerEvent) => {
    if (swipeStartX.current === null) return
    const deltaX = event.clientX - swipeStartX.current
    swipeStartX.current = null
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) goTo(index + (deltaX < 0 ? 1 : -1))
  }

  return (
    <section
      className={s.hero}
      aria-roledescription="carousel"
      aria-label="Онцлох бараа"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipeStartX.current = null
      }}
    >
      <div className={s.stage}>
        <div key={slide.id} className={s.slide} aria-roledescription="slide" aria-label={`${index + 1} / ${count}`}>
          <span className={s.ghost} aria-hidden="true">
            {slide.ghost}
          </span>
          <div className={s.content}>
            <span className={s.kicker}>{slide.kicker}</span>
            <h1 className={s.title}>{slide.title}</h1>
            <Link to={slide.href} className={s.cta}>
              ХУДАЛДАЖ АВАХ
            </Link>
          </div>
          {slide.image ? (
            <>
              <img className={s.shoe} src={slide.image} alt={slide.imageAlt} />
              <img className={cx(s.shoe, s.shoeMirrored)} src={slide.image} alt="" />
            </>
          ) : (
            <div className={s.shoePlaceholder} aria-hidden="true">
              {slide.ghost}
            </div>
          )}
        </div>

        <button type="button" className={cx(s.arrow, s.arrowPrev)} aria-label="Өмнөх" onClick={() => goTo(index - 1)}>
          <ChevronLeftIcon size={22} strokeWidth={2} />
        </button>
        <button type="button" className={cx(s.arrow, s.arrowNext)} aria-label="Дараах" onClick={() => goTo(index + 1)}>
          <ChevronRightIcon size={22} strokeWidth={2} />
        </button>

        <div className={s.dots}>
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={cx(s.dot, i === index && s.dotActive)}
              aria-label={`Слайд ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
            >
              <span className={s.dotBar} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
