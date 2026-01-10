'use client'

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

type PButtonProps = {
  children?: ReactNode
  style?: CSSProperties
  className?: string
  type?: 'button' | 'submit' | 'reset'
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>

const PButton = ({ children, style, className = '', type = 'button', ...restProps }: PButtonProps) => {
  return (
    <button type={type} style={style} className={className} {...restProps}>
      {children}
    </button>
  )
}

export default PButton
