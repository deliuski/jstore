import { Navigate, useLocation } from 'react-router'
import { PageError, PageLoader } from '../../components/PageStatus/PageStatus'
import { useAdminState } from '../../hooks/data'
import { AdminTheme } from '../components/AdminTheme/AdminTheme'
import { adminTitle } from '../components/title'
import { AdminShell } from './AdminShell'
import { ADMIN_LOGIN_PATH } from './nav'
import { NoAccess } from './NoAccess'
import s from './AdminLayout.module.css'

/** Auth guard for /admin/*: login redirect, "no access" screen, or the admin shell. */
export function AdminLayout() {
  const { data: admin, loading } = useAdminState()
  const location = useLocation()

  if (!admin) {
    return (
      <AdminTheme className={s.center}>
        <title>{adminTitle('Удирдлага')}</title>
        {loading ? <PageLoader /> : <PageError message="Нэвтрэлтийг шалгаж чадсангүй. Хуудсаа дахин ачаална уу." />}
      </AdminTheme>
    )
  }

  if (!admin.user) return <Navigate to={ADMIN_LOGIN_PATH} replace state={{ from: location }} />
  if (!admin.isAdmin) return <NoAccess email={admin.user.email} uid={admin.user.uid} />
  return <AdminShell adminName={admin.name} />
}
