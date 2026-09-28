import { BRAND } from '../../data/site'

/** Browser tab title for an admin page: `<title>{adminTitle('Захиалга')}</title>`. */
export function adminTitle(page: string): string {
  return `${page} · ${BRAND.name} удирдлага`
}
