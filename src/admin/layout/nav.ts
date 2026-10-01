import type { ComponentType, SVGProps } from 'react'
import {
  BoxIcon,
  GridIcon,
  HourglassIcon,
  ImageStackIcon,
  LayersIcon,
  ReceiptIcon,
  SettingsIcon,
  MessageIcon,
} from '../components/icons'

export const ADMIN_HOME_PATH = '/admin'
export const ADMIN_LOGIN_PATH = '/admin/login'

type NavIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

export type AdminNavItem = { label: string; icon: NavIcon; to: string; showNewOrders?: boolean }

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Самбар', to: ADMIN_HOME_PATH, icon: GridIcon },
  { label: 'Захиалга', to: '/admin/orders', icon: ReceiptIcon, showNewOrders: true },
  { label: 'Бараа', to: '/admin/products', icon: BoxIcon },
  { label: 'Баннер', to: '/admin/banners', icon: ImageStackIcon },
  { label: 'Нөөц · размер', to: '/admin/inventory', icon: LayersIcon },
  { label: 'Урьдчилсан захиалга', to: '/admin/preorders', icon: HourglassIcon },
  { label: 'Имэйл', to: '/admin/emails', icon: MessageIcon },
  { label: 'Тохиргоо', to: '/admin/settings', icon: SettingsIcon },
]
