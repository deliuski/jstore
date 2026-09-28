import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ChatIcon, CheckIcon } from '../../components/icons'
import { PageError, PageLoader } from '../../components/PageStatus/PageStatus'
import { ProductCard } from '../../components/ProductCard/ProductCard'
import { ProductGrid } from '../../components/ProductGrid/ProductGrid'
import { useShop } from '../../context/shop'
import { BRAND, CART_PATH, CATALOG_PATH } from '../../data/site'
import { useCatalog, useStoreSettings } from '../../hooks/data'
import { formatPrice } from '../../lib/format'
import {
  CATEGORY_LABELS,
  availableSizes,
  getProductTag,
  hasSizes,
  isSoldOut,
  type Product,
} from '../../models/product'
import { NotFoundPage } from '../NotFoundPage/NotFoundPage'
import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'
import { SizePicker } from './SizePicker'
import s from './ProductPage.module.css'

// The design opens with EU 42 selected.
const DEFAULT_SIZE = '42'
const RELATED_COUNT = 5

function initialSize(product: Product, requested: string | null): string | null {
  const selectable = product.status === 'soon' ? product.sizes.map((size) => size.label) : availableSizes(product)
  if (requested && selectable.includes(requested)) return requested
  return selectable.includes(DEFAULT_SIZE) ? DEFAULT_SIZE : null
}

export function ProductPage() {
  const { id } = useParams()
  const catalog = useCatalog()
  if (catalog.loading) return <PageLoader />
  if (!catalog.data) return <PageError />

  const product = catalog.data.find((item) => item.id === id)
  if (!product) return <NotFoundPage />

  const related = catalog.data
    .filter((item) => item.id !== product.id && item.status === 'active')
    .slice(0, RELATED_COUNT)
  // Keyed so size/gallery state resets when moving between products.
  return <ProductDetails key={product.id} product={product} related={related} />
}

function ProductDetails({ product, related }: { product: Product; related: Product[] }) {
  const [searchParams] = useSearchParams()
  const { addToCart } = useShop()
  const { messengerUrl } = useStoreSettings()
  const [size, setSize] = useState(() => initialSize(product, searchParams.get('size')))
  const [added, setAdded] = useState(false)

  const tag = getProductTag(product)
  const preorder = product.status === 'soon'
  const soldOut = isSoldOut(product)
  const crumb =
    tag === 'new'
      ? { label: 'Шинэ', to: `${CATALOG_PATH}?tag=new` }
      : { label: CATEGORY_LABELS[product.category], to: `${CATALOG_PATH}?cat=${product.category}` }

  const selectSize = (label: string) => {
    setSize(label)
    setAdded(false)
  }

  const handleAddToCart = () => {
    if (hasSizes(product) && !size) return
    addToCart(product.id, hasSizes(product) ? size : null)
    setAdded(true)
  }

  return (
    <>
      <title>{`${product.name} — ${BRAND.name}`}</title>

      <nav className={s.breadcrumb} aria-label="Талх мөр">
        <ol className={s.crumbs}>
          <li>
            <Link to="/" className={s.crumbLink}>
              Нүүр
            </Link>
          </li>
          <li>
            <Link to={crumb.to} className={s.crumbLink}>
              {crumb.label}
            </Link>
          </li>
          <li className={s.crumbCurrent} aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <section className={s.main}>
        <ProductGallery product={product} />

        <div className={s.details}>
          <div className={s.heading}>
            <h1 className={s.name}>{product.name}</h1>
            <span className={s.brand}>{product.brand}</span>
            <span className={s.price}>
              {formatPrice(product.price)}
              {tag === 'sale' && <span className={s.oldPrice}>{formatPrice(product.oldPrice, '[Хуучин үнэ]')}</span>}
            </span>
          </div>

          <div className={s.divider} />

          {hasSizes(product) && (
            <SizePicker sizes={product.sizes} selected={size} onSelect={selectSize} preorder={preorder} />
          )}

          <div className={s.actions}>
            <button
              type="button"
              className={s.addToCart}
              disabled={soldOut || (hasSizes(product) && !size)}
              onClick={handleAddToCart}
            >
              {soldOut ? 'ДУУССАН' : preorder ? 'УРЬДЧИЛАН ЗАХИАЛАХ' : 'САГСАНД НЭМЭХ'}
            </button>
            <a href={messengerUrl} className={s.messenger}>
              <ChatIcon size={20} />
              MESSENGER-ЭЭР АСУУХ
            </a>
          </div>

          {added && (
            <div className={s.added} role="status">
              <span className={s.addedText}>
                <CheckIcon size={20} strokeWidth={2.4} />
                {size && hasSizes(product) ? `EU ${size} сагсанд нэмэгдлээ` : 'Сагсанд нэмэгдлээ'}
              </span>
              <Link to={CART_PATH} className={s.addedLink}>
                Сагс харах
              </Link>
            </div>
          )}

          <ProductInfo description={product.description} />
        </div>
      </section>

      {related.length > 0 && (
        <section className={s.related} aria-labelledby="related-title">
          <h2 id="related-title" className={s.relatedTitle}>
            Танд таалагдаж магадгүй
          </h2>
          <ProductGrid className={s.relatedGrid}>
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </ProductGrid>
        </section>
      )}
    </>
  )
}
