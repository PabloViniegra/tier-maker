import type { ImgHTMLAttributes } from 'react'

type NextImageProps = {
  src: string
  alt: string
} & ImgHTMLAttributes<HTMLImageElement>

export default function Image({ src, alt, ...props }: NextImageProps) {
  return <img src={src} alt={alt} {...props} />
}
