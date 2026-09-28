import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ChevronLeftIcon } from '../../../components/icons'
import { useAdminState } from '../../../hooks/data'
import { authErrorMessage, signInAdmin } from '../../../services/auth'
import { AdminTheme } from '../../components/AdminTheme/AdminTheme'
import { Button } from '../../components/Button/Button'
import { TextField } from '../../components/Form/TextField'
import { Notice } from '../../components/Notice/Notice'
import { adminTitle } from '../../components/title'
import { AdminLogo } from '../../layout/AdminLogo'
import { redirectTarget } from './redirect'
import s from './LoginPage.module.css'

export function LoginPage() {
  const { data: admin } = useAdminState()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const target = redirectTarget(location.state)
  if (admin?.isAdmin) return <Navigate to={target} replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Имэйл болон нууц үгээ оруулна уу')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await signInAdmin(email, password)
      navigate(target, { replace: true })
    } catch (signInError) {
      setError(authErrorMessage(signInError))
      setBusy(false)
    }
  }

  return (
    <AdminTheme className={s.page}>
      <title>{adminTitle('Нэвтрэх')}</title>
      <main className={s.card}>
        <AdminLogo onLight />
        <h1 className={s.title}>Нэвтрэх</h1>
        <p className={s.lead}>Дэлгүүрийн удирдлагын хэсэг</p>

        <form className={s.form} onSubmit={submit} noValidate>
          {error && <Notice tone="error">{error}</Notice>}
          <TextField
            label="Имэйл"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Нууц үг"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" block busy={busy} className={s.submit}>
            Нэвтрэх
          </Button>
        </form>
      </main>

      <Link to="/" className={s.back}>
        <ChevronLeftIcon size={16} strokeWidth={2} />
        Дэлгүүр рүү буцах
      </Link>
    </AdminTheme>
  )
}
