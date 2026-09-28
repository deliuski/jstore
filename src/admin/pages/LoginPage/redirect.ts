import type { Location } from 'react-router'
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from '../../layout/nav'

/** Where to go after signing in: the admin page that sent us here (`state.from`), else the dashboard. */
export function redirectTarget(state: unknown): string {
  const from = (state as { from?: Partial<Location> } | null)?.from
  const pathname = from?.pathname ?? ''
  if (!pathname.startsWith(ADMIN_HOME_PATH) || pathname.startsWith(ADMIN_LOGIN_PATH)) return ADMIN_HOME_PATH
  return `${pathname}${from?.search ?? ''}${from?.hash ?? ''}`
}
