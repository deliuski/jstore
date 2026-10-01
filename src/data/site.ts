/**
 * Static site content (navigation, labels).
 * Store details — address, phone, hours, map, social links — live in Firebase
 * (Admin → Тохиргоо); their defaults are in src/models/settings.ts.
 */

export interface NavLink {
  label: string
  to: string
}

/** Logo text. */
export const BRAND = {
  name: 'JORDAN',
  tagline: 'ГУТЛИЙН ИХ ДЭЛГҮҮР',
}


export const CATALOG_PATH = '/products'
export const CART_PATH = '/cart'
export const CHECKOUT_PATH = '/checkout'
export const LOCATION_PATH = '/location'
export const TERMS_PATH = '/terms'
export const PRIVACY_PATH = '/privacy-policy'
export const SHIPPING_RETURNS_PATH = '/shipping-returns'
export const SIZE_GUIDE_PATH = '/'

export const MAIN_NAV: NavLink[] = [
  { label: 'Удахгүй ирнэ', to: `${CATALOG_PATH}?status=soon` },
  { label: 'Шинэ', to: `${CATALOG_PATH}?tag=new` },
  { label: 'Пүүз', to: `${CATALOG_PATH}?cat=sneaker` },
  { label: 'Өвлийн гутал', to: `${CATALOG_PATH}?cat=boot` },
  { label: 'Цүнх', to: `${CATALOG_PATH}?cat=bag` },
  { label: 'Хямдрал', to: `${CATALOG_PATH}?tag=sale` },
]

export const FOOTER_GROUPS: {
  title: string
  links: (NavLink & { desktopOnly?: boolean })[]
}[] = [
  {
    title: 'Мэдээлэл',
    links: [
      { label: 'Бүх бараа', to: CATALOG_PATH },
      { label: 'Дэлгүүрийн байршил', to: LOCATION_PATH },
      { label: 'Солих & буцаах', to: '/' },
    ],
  },
  {
    title: 'Бусад',
    links: [
      { label: 'Размерын заавар', to: SIZE_GUIDE_PATH },
      { label: 'Үйлчилгээний нөхцөл', to: TERMS_PATH },
      { label: 'Нууцлалын бодлого', to: PRIVACY_PATH },
      { label: 'Сайтын бүтэц', to: '/', desktopOnly: true },
    ],
  },
]

export const PAYMENT_METHODS: {
  label: string
  desktopOnly?: boolean
}[] = [
  { label: 'Онлайн төлбөр' },
  { label: 'QPay' },
  { label: 'SocialPay' },
]

export const WEBSITE_CREDIT = 'Вэбсайт: Playzone'

export const ANNOUNCEMENTS: {
  text: string
  linkLabel: string
  href: string
}[] = [
  {
    text: 'Шинэ бараа ирэхэд хамгийн түрүүнд мэдээрэй',
    linkLabel: 'Дэлгэрэнгүй',
    href: '#footer',
  },
]

export const PRODUCT_INFO_SECTIONS: {
  id: string
  title: string
  body: string
}[] = [
  {
    id: 'desc',
    title: 'Тайлбар',
    body: 'Барааны материал, өнгө, загвар болон онцлог мэдээллийг бүтээгдэхүүний тайлбараас үзнэ үү.',
  },
  {
    id: 'ship',
    title: 'Хүргэлт',
    body: 'Улаанбаатар хот дотор хүргэлттэй. Мөн дэлгүүрээс очиж авах боломжтой.',
  },
  {
    id: 'pay',
    title: 'Төлбөр',
    body: 'Онлайн төлбөр — QPay, SocialPay болон банкар карт Bonum-ээр.',
  },
  {
    id: 'ret',
    title: 'Солих, буцаах',
    body: 'Размер болон бараатай холбоотой асуудал гарсан тохиолдолд дэлгүүрийн солих, буцаах нөхцөлийн дагуу шийдвэрлэнэ.',
  },
]
