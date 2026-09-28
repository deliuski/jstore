import type { ReactNode, SVGProps } from 'react'

/* Icons for the product pages (list, form, inventory), in the admin 24px line style. */
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

export const StarIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
  </Icon>
)

export const PencilIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M15.5 4.5l4 4L8.5 19.5H4.5v-4z" />
    <path d="M13 7l4 4" />
  </Icon>
)

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 6.5h16M9.5 6.5V4h5v2.5" />
    <path d="M6 6.5l1 13.5h10l1-13.5" />
    <path d="M10 10.5v6M14 10.5v6" />
  </Icon>
)

export const UploadIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 15.5V4M7.5 8.5L12 4l4.5 4.5" />
    <path d="M4.5 15v4.5h15V15" />
  </Icon>
)
