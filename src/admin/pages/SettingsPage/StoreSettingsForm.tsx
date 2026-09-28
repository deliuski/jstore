import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { cx } from '../../../lib/cx'
import type { StoreSettings } from '../../../models/settings'
import { saveStoreSettings } from '../../../services/settings'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { TextArea } from '../../components/Form/TextArea'
import { TextField } from '../../components/Form/TextField'
import { useToast } from '../../components/Toast/toast'
import { LocationCard } from './LocationCard'
import {
  formsEqual,
  parseForm,
  toForm,
  type StoreForm,
  type StoreFormErrors,
  type StoreFormField,
} from './storeForm'
import s from './StoreSettingsForm.module.css'

const NO_ERRORS: StoreFormErrors = {}

/**
 * Store details, social links and map location, saved together.
 * Only the fields the admin touched are kept in `edits`, laid over the live settings: a snapshot
 * arriving mid-edit never overwrites them, and changes to the other fields still show up.
 */
export function StoreSettingsForm({ settings, className }: { settings: StoreSettings; className?: string }) {
  const toast = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [edits, setEdits] = useState<Partial<StoreForm>>({})
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)

  const saved = toForm(settings)
  const form = { ...saved, ...edits }
  const dirty = !formsEqual(form, saved)
  const parsed = parseForm(form)
  const errors = showErrors && !parsed.ok ? parsed.errors : NO_ERRORS

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const update = (patch: Partial<StoreForm>) => setEdits((current) => ({ ...current, ...patch }))

  const bind = (field: StoreFormField) => ({
    name: field,
    value: form[field],
    error: errors[field],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update({ [field]: event.target.value }),
  })

  const revert = () => {
    setEdits({})
    setShowErrors(false)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!dirty || saving) return
    if (!parsed.ok) {
      flushSync(() => setShowErrors(true))
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    const submitted = edits
    setSaving(true)
    try {
      await saveStoreSettings(parsed.settings)
      // The snapshot already holds the saved values; keep anything typed while saving.
      setEdits((current) => (current === submitted ? {} : current))
      setShowErrors(false)
      toast('Дэлгүүрийн мэдээлэл хадгалагдлаа')
    } catch {
      toast('Хадгалж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const status = saving
    ? 'Хадгалж байна…'
    : showErrors && !parsed.ok
      ? 'Улаанаар тэмдэглэсэн талбаруудыг засна уу'
      : dirty
        ? 'Хадгалаагүй өөрчлөлт байна'
        : 'Хадгалаагүй өөрчлөлт алга'

  return (
    <form ref={formRef} className={cx(s.form, className)} onSubmit={submit} noValidate>
      <Card title="Дэлгүүрийн мэдээлэл">
        <div className={s.fields}>
          <TextField label="Дэлгүүрийн нэр" required className={s.full} {...bind('name')} />
          <TextField
            label="Утас"
            type="tel"
            required
            hint="8 оронтой дугаар, жишээ нь 9996 1353"
            {...bind('phone')}
          />
          <TextField label="Цагийн хуваарь" required hint="Жишээ нь: Өдөр бүр: 10:00–21:00" {...bind('hours')} />
          <TextArea
            label="Хаяг"
            required
            rows={3}
            hint="Мөр бүрийг шинэ мөрөнд бичнэ — сайт дээр яг ингэж харагдана"
            className={s.full}
            {...bind('address')}
          />
        </div>
      </Card>

      <Card title="Сошиал хаяг">
        <div className={s.fields}>
          <TextField label="Facebook" type="url" required placeholder="https://www.facebook.com/…" {...bind('facebookUrl')} />
          <TextField
            label="Instagram"
            type="url"
            required
            placeholder="https://www.instagram.com/…"
            {...bind('instagramUrl')}
          />
          <TextField
            label="Messenger"
            type="url"
            required
            placeholder="https://m.me/…"
            hint="Удирдлагын цэсний Messenger холбоос мөн үүнийг ашиглана"
            className={s.full}
            {...bind('messengerUrl')}
          />
        </div>
      </Card>

      <LocationCard form={form} errors={errors} fallback={settings.location} onChange={update} />

      <div className={cx(s.bar, (dirty || saving) && s.floating)}>
        <p className={cx(s.status, dirty && s.statusDirty, showErrors && !parsed.ok && s.statusError)} aria-live="polite">
          {status}
        </p>
        <div className={s.actions}>
          <Button variant="secondary" className={s.action} disabled={!dirty || saving} onClick={revert}>
            Буцаах
          </Button>
          <Button type="submit" className={s.action} disabled={!dirty} busy={saving}>
            Хадгалах
          </Button>
        </div>
      </div>
    </form>
  )
}
