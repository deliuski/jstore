import { useState } from 'react'
import { signOutAdmin } from '../../../services/auth'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { LogoutIcon } from '../../components/icons'
import { useToast } from '../../components/Toast/toast'
import s from './AccountCard.module.css'

interface AccountCardProps {
  email: string | null
  className?: string
}

/** «Бүртгэл»: who is signed in, and sign-out. */
export function AccountCard({ email, className }: AccountCardProps) {
  const toast = useToast()
  const [signingOut, setSigningOut] = useState(false)

  // On success the admin layout sends the user to the login page.
  const signOut = () => {
    setSigningOut(true)
    signOutAdmin().catch(() => {
      setSigningOut(false)
      toast('Гарах үед алдаа гарлаа', 'error')
    })
  }

  return (
    <Card title="Бүртгэл" className={className}>
      <div className={s.row}>
        <p className={s.label}>Имэйл</p>
        <p className={s.value}>{email ?? '—'}</p>
      </div>
      <Button variant="secondary" icon={<LogoutIcon size={18} />} busy={signingOut} onClick={signOut} className={s.signOut}>
        Гарах
      </Button>
    </Card>
  )
}
