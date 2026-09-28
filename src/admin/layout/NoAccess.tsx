import { useState } from 'react'
import { CheckIcon } from '../../components/icons'
import { signOutAdmin } from '../../services/auth'
import { AdminTheme } from '../components/AdminTheme/AdminTheme'
import { Button } from '../components/Button/Button'
import { ButtonLink } from '../components/Button/ButtonLink'
import { CopyIcon } from '../components/icons'
import { adminTitle } from '../components/title'
import { AdminLogo } from './AdminLogo'
import s from './NoAccess.module.css'

/** Signed in, but without an `admins/{uid}` document — explains how to grant access. */
export function NoAccess({ email, uid }: { email: string | null; uid: string }) {
  const [copied, setCopied] = useState(false)

  const copyUid = () => {
    navigator.clipboard.writeText(uid).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <AdminTheme className={s.page}>
      <title>{adminTitle('Эрх алга')}</title>
      <div className={s.card}>
        <AdminLogo onLight />
        <h1 className={s.title}>Танд админ эрх алга</h1>
        <p className={s.lead}>
          Нэвтэрсэн бүртгэл: <strong>{email ?? uid}</strong>. Энэ бүртгэлд удирдлагын хэсэгт орох эрх олгогдоогүй
          байна.
        </p>

        <div className={s.uidBox}>
          <div className={s.uidText}>
            <p className={s.uidLabel}>UID</p>
            <p className={s.uid}>{uid}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            onClick={copyUid}
          >
            {copied ? 'Хуулсан' : 'Хуулах'}
          </Button>
        </div>

        <ol className={s.steps}>
          <li>
            Firebase console → <strong>Firestore Database</strong> руу орно.
          </li>
          <li>
            <code>admins</code> collection-д шинэ document нэмж, <strong>Document ID</strong>-д дээрх UID-г оруулна.
          </li>
          <li>
            <code>name</code> (string) талбарт өөрийн нэрийг бичээд хадгална. Дараа нь энэ хуудсыг дахин ачаална.
          </li>
        </ol>

        <div className={s.actions}>
          <Button onClick={() => window.location.reload()}>Дахин шалгах</Button>
          <Button variant="secondary" onClick={() => signOutAdmin()}>
            Гарах
          </Button>
          <ButtonLink to="/" variant="ghost">
            Дэлгүүр рүү
          </ButtonLink>
        </div>
      </div>
    </AdminTheme>
  )
}
