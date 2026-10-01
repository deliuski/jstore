import { useState } from 'react'
import { CloseIcon, PlusIcon } from '../../../components/icons'
import { PageLoader } from '../../../components/PageStatus/PageStatus'
import { useAllProducts, useBanners } from '../../../hooks/data'
import { emptyBanner, type Banner } from '../../../models/settings'
import { deleteBanner, saveBanner } from '../../../services/settings'
import { AdminPageHeader } from '../../components/AdminPageHeader/AdminPageHeader'
import { Notice } from '../../components/Notice/Notice'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { useToast } from '../../components/Toast/toast'
import { adminTitle } from '../../components/title'
import { errorMessage } from '../ProductFormPage/productForm'
import { BannerFormCard } from './BannerFormCard'
import s from './BannersPage.module.css'

interface Editing {
  /** `null` = a new banner. */
  id: string | null
  values: Omit<Banner, 'id'>
}

export function BannersPage() {
  const banners = useBanners()
  const products = useAllProducts(true)
  const toast = useToast()
  const [editing, setEditing] = useState<Editing | null>(null)
  const [toDelete, setToDelete] = useState<Banner | null>(null)
  const [deleting, setDeleting] = useState(false)

  const all = banners.data ?? []

  const addBanner = () => {
    const sortOrder = all.length > 0 ? Math.max(...all.map((banner) => banner.sortOrder)) + 10 : 10
    setEditing({ id: null, values: emptyBanner(sortOrder) })
  }

  const remove = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteBanner(toDelete.id)
      toast('Баннер устгагдлаа')
      setToDelete(null)
    } catch (error) {
      toast(`Устгаж чадсангүй: ${errorMessage(error)}`, 'error')
      setDeleting(false)
    }
  }

  const productLabel = (banner: Banner) => {
    const product = (products.data ?? []).find((item) => item.id === banner.productId)
    return product ? product.name : 'Бүх бараа руу'
  }

  return (
    <>
      <title>{adminTitle('Баннер')}</title>
      <AdminPageHeader
        title="Баннер"
        subtitle={banners.data && `${all.length} слайд — нүүр хуудасны баннер`}
        actions={
          <Button className={s.add} icon={<PlusIcon size={20} strokeWidth={2} />} onClick={addBanner}>
            Баннер нэмэх
          </Button>
        }
      />

      {banners.loading && !banners.data ? (
        <PageLoader />
      ) : (
        <div className={s.stack}>
          {/* A rules/deployment problem keeps the page usable — the error notice explains it. */}
          {banners.error && (
            <Notice tone="error">
              Баннерын жагсаалтыг уншиж чадсангүй ({banners.error.message}). Firestore rules-ийг шалгаад хуучин
              хуудсаа дахин нээнэ үү.
            </Notice>
          )}

          {all.length === 0 && !editing && !banners.error && (
            <Card>
              <EmptyState
                title="Баннер алга"
                text="Нүүр хуудасны баннерт слайд нэмнэ үү. Слайд бүр зураг, бичвэр, холбох бараатай байна."
                action={
                  <Button icon={<PlusIcon size={20} strokeWidth={2} />} onClick={addBanner}>
                    Баннер нэмэх
                  </Button>
                }
              />
            </Card>
          )}

          {editing && (
            <BannerFormCard
              key={editing.id ?? 'new'}
              initial={editing.values}
              saving={!editing.id}
              products={products.data ?? []}
              onCancel={() => setEditing(null)}
              onSave={async (values) => {
                try {
                  await saveBanner(editing.id, values)
                  toast(editing.id ? 'Баннер хадгалагдлаа' : 'Баннер нэмэгдлээ')
                  setEditing(null)
                } catch (error) {
                  toast(`Хадгалж чадсангүй: ${errorMessage(error)}`, 'error')
                }
              }}
            />
          )}

          {all.map((banner) => (
            <Card key={banner.id} className={s.row}>
              <div className={s.preview}>
                {banner.image ? (
                  <img className={s.image} src={banner.image} alt="" />
                ) : (
                  <span className={s.ghost} aria-hidden="true">
                    {banner.ghost || 'ANZO'}
                  </span>
                )}
              </div>
              <div className={s.info}>
                <p className={s.kicker}>{banner.kicker}</p>
                <p className={s.title}>{banner.title || '(Барааны нэр)'}</p>
                <p className={s.meta}>Холбоос: {productLabel(banner)}</p>
              </div>
              <div className={s.actions}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditing({ id: banner.id, values: { ...banner } })}
                >
                  Засах
                </Button>
                <button
                  type="button"
                  className={s.remove}
                  aria-label={`${banner.title || 'Баннер'} устгах`}
                  onClick={() => setToDelete(banner)}
                >
                  <CloseIcon size={16} strokeWidth={2} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Баннер устгах уу?"
        message={`«${toDelete?.title || 'Баннер'}» слайд нүүр хуудаснаас бүр мөсөн устгагдана.`}
        confirmLabel="Устгах"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
