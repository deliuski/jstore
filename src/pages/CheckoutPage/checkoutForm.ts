import { isValidPhone, type DeliveryMethod, type PaymentMethod } from '../../models/order'

export interface CheckoutValues {
  name: string
  phone: string
  delivery: DeliveryMethod
  district: string
  address: string
  note: string
  payment: PaymentMethod
}

/** Fields that can be invalid, in on-screen order (the first one gets focus). */
export const CHECKED_FIELDS = ['name', 'phone', 'district', 'address'] as const
export type CheckedField = (typeof CHECKED_FIELDS)[number]
export type CheckoutErrors = Partial<Record<CheckedField, string>>

/** Length limits from firestore.rules. */
export const MAX_LENGTH = { name: 80, address: 300, note: 500 }

export const INITIAL_VALUES: CheckoutValues = {
  name: '',
  phone: '',
  delivery: 'delivery',
  district: '',
  address: '',
  note: '',
  payment: 'bonum',
}

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {}
  if (!values.name.trim()) errors.name = 'Нэрээ оруулна уу.'
  if (!values.phone.trim()) errors.phone = 'Утасны дугаараа оруулна уу.'
  else if (!isValidPhone(values.phone)) errors.phone = 'Утасны дугаар 8 оронтой байх ёстой.'
  if (values.delivery === 'delivery') {
    if (!values.district) errors.district = 'Дүүргээ сонгоно уу.'
    if (!values.address.trim()) errors.address = 'Хүргэх хаягаа оруулна уу.'
  }
  return errors
}

/** "9911-22 33" → "99112233" — how the number is stored and used in the transfer reference. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, '')
}
