import { PageError, PageLoader } from '../../../components/PageStatus/PageStatus'
import { useAdminState } from '../../../hooks/data'
import { useLive } from '../../../lib/liveQuery'
import { subscribeStoreSettings } from '../../../services/settings'
import { AdminPageHeader } from '../../components/AdminPageHeader/AdminPageHeader'
import { Card } from '../../components/Card/Card'
import { adminTitle } from '../../components/title'
import { AccountCard } from './AccountCard'
import { StoreSettingsForm } from './StoreSettingsForm'
import s from './SettingsPage.module.css'

export function SettingsPage() {
  // The same shared listener as useStoreSettings(), but with its loading/error state:
  // the form must start from the saved settings, never from the built-in defaults.
  const store = useLive('settings/store', subscribeStoreSettings)
  const { data: admin } = useAdminState()

  return (
    <>
      <title>{adminTitle('Тохиргоо')}</title>
      <AdminPageHeader title="Тохиргоо" subtitle="Дэлгүүрийн мэдээлэл, байршил, бүртгэл" />

      <div className={s.layout}>
        {store.data ? (
          <StoreSettingsForm settings={store.data} />
        ) : (
          <Card>{store.loading ? <PageLoader /> : <PageError />}</Card>
        )}

        {admin?.user && <AccountCard email={admin.user.email} />}
      </div>
    </>
  )
}
