import type { ReactNode, SVGProps } from 'react'

/*
 * Admin-only icons (sidebar, dashboard). Same 24px line style as the storefront set;
 * import SearchIcon, PlusIcon, MenuIcon, CloseIcon … from src/components/icons.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }

function Icon({ size = 18, strokeWidth = 1.6, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const GridIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Icon>
)

export const ReceiptIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 2.5h12v19l-3-2-3 2-3-2-3 2z" />
    <path d="M9 7.5h6M9 11.5h6" />
  </Icon>
)

export const BoxIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 2.8l8.5 4.6v9.2L12 21.2l-8.5-4.6V7.4z" />
    <path d="M3.5 7.4L12 12l8.5-4.6M12 12v9.2" />
  </Icon>
)

export const LayersIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3l9 4.5-9 4.5-9-4.5z" />
    <path d="M3 12l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />
  </Icon>
)

export const ImageStackIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="7.5" y="3.5" width="13" height="10" rx="1.5" />
    <path d="M4 7.5v10A3 3 0 0 0 7 20.5h10" />
    <path d="M7.5 13.5l3-3 4 4 2.5-2.5 3.5 3.5" />
  </Icon>
)

export const HourglassIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 2.5h12M6 21.5h12" />
    <path d="M7.5 2.5v3.2c0 1 .4 1.9 1.2 2.5L12 12l3.3-3.8c.8-.6 1.2-1.5 1.2-2.5V2.5" />
    <path d="M7.5 21.5v-3.2c0-1 .4-1.9 1.2-2.5L12 12l3.3 3.8c.8.6 1.2 1.5 1.2 2.5v3.2" />
  </Icon>
)

export const MessageIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 4.5h16v11.5H8.5L4 20z" />
  </Icon>
)

export const SettingsIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
  </Icon>
)

export const BellIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </Icon>
)

export const TruckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2.5 5.5h11.5v10H2.5z" />
    <path d="M14 8.5h4l3.5 3.5v3.5H14" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17.5" cy="17.5" r="1.8" />
  </Icon>
)

export const LogoutIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 16.5L5.5 12 10 7.5M5.5 12H15" />
  </Icon>
)

export const StoreIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 10v10h16V10" />
    <path d="M3 4h18l-1 6H4z" />
    <path d="M10 20v-5h4v5" />
  </Icon>
)

export const CopyIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
    <path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
  </Icon>
)
