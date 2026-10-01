import { useMemo, useState, type FormEvent } from 'react'
import { PageError, PageLoader } from '../../../components/PageStatus/PageStatus'
import { useEmailSubscribers } from '../../../hooks/data'
import { formatDateTime } from '../OrdersPage/dates'
import { sendSubscriberAnnouncement } from '../../../services/emailSubscribers'
import { AdminPageHeader } from '../../components/AdminPageHeader/AdminPageHeader'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { TextArea } from '../../components/Form/TextArea'
import { TextField } from '../../components/Form/TextField'
import { adminTitle } from '../../components/title'
import { useToast } from '../../components/Toast/toast'
import s from './EmailsPage.module.css'

const DEFAULT_SUBJECT = 'Шинэ бараа ирлээ'
const DEFAULT_BODY = 'Сайн байна уу,\n\nМанай дэлгүүрт шинэ бараанууд нэмэгдлээ. Дэлгэрэнгүйг веб дээрээс шалгаарай.'

export function EmailsPage() {
  const toast = useToast()
  const { data: subscribers, loading, error } = useEmailSubscribers()
  const [subject, setSubject] = useState(DEFAULT_SUBJECT)
  const [body, setBody] = useState(DEFAULT_BODY)
  const [showErrors, setShowErrors] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const errors = {
    subject: showErrors && !subject.trim() ? 'Гарчгийг оруулна уу' : undefined,
    body: showErrors && !body.trim() ? 'Имэйлийн агуулгыг оруулна уу' : undefined,
  }

  const latestSubscribers = useMemo(() => subscribers?.slice(0, 8) ?? [], [subscribers])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!subject.trim() || !body.trim()) {
      setShowErrors(true)
      return
    }

    setSending(true)
    setStatus(null)
    try {
      const recipientCount = await sendSubscriberAnnouncement(subject, body)
      setStatus(`Илгээлээ. ${recipientCount} хэрэглэгч рүү хүргэлээ.`)
      toast('Имэйл амжилттай илгээгдлээ')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Имэйл илгээж чадсангүй'
      setStatus(message)
      toast('Имэйл илгээж чадсангүй', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <title>{adminTitle('Имэйл')}</title>
      <AdminPageHeader title="Имэйл" subtitle="Бараа сонирхсон хэрэглэгчдэд мэдэгдэл илгээх" />

      <div className={s.layout}>
        <Card title="Мэдэгдэл илгээх" className={s.compose}>
          <form className={s.form} onSubmit={submit} noValidate>
            <TextField label="Гарчиг" required value={subject} error={errors.subject} onChange={(event) => setSubject(event.target.value)} />
            <TextArea
              label="Имэйлийн агуулга"
              required
              rows={10}
              hint="Шинэ бараа, хямдрал, эсвэл онцлох мэдээ оруулж болно"
              value={body}
              error={errors.body}
              onChange={(event) => setBody(event.target.value)}
            />
            <div className={s.formActions}>
              <p className={s.status} aria-live="polite">
                {status ?? 'Бүх бүртгэлтэй имэйлд нэг дор илгээнэ.'}
              </p>
              <Button type="submit" busy={sending} className={s.send}>
                Илгээх
              </Button>
            </div>
          </form>
        </Card>

        <div className={s.sidebar}>
          <Card title="Бүртгэгдсэн имэйл" className={s.summary}>
            {loading ? (
              <PageLoader />
            ) : error ? (
              <PageError />
            ) : (
              <>
                <p className={s.count}>{subscribers?.length ?? 0}</p>
                <p className={s.countLabel}>хэрэглэгч мэдэгдэл хүлээж байна</p>
              </>
            )}
          </Card>

          <Card title="Сүүлд бүртгүүлсэн" className={s.recent}>
            {latestSubscribers.length === 0 ? (
              <p className={s.empty}>Одоогоор бүртгэл алга.</p>
            ) : (
              <ul className={s.list}>
                {latestSubscribers.map((subscriber) => (
                  <li key={subscriber.id} className={s.item}>
                    <div className={s.itemTop}>
                      <strong className={s.email}>{subscriber.email}</strong>
                      <span className={s.time}>{subscriber.updatedAt ? formatDateTime(subscriber.updatedAt) : 'Шинэ'}</span>
                    </div>
                    <p className={s.product}>{subscriber.productName}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
