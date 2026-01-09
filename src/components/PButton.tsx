'use client'

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

type PButtonProps = {
  children?: ReactNode
  style?: CSSProperties
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const PButton = ({ children, style, className = '', ...restProps }: PButtonProps) => {
  return (
    <button type="button" style={style} className={className} {...restProps}>
      {children}
    </button>
  )
}

export default PButton
