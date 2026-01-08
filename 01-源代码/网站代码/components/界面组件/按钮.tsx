'use client'

import { ArrowRight, Check } from 'lucide-react'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: 'arrow' | 'check' | 'none'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = 'arrow',
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'rounded-button font-medium transition-all duration-200 inline-flex items-center justify-center'

  const variantStyles = {
    primary: 'bg-primary-pink text-white hover:bg-primary-pink/90 active:bg-primary-pink/80',
    secondary: 'bg-primary-blue text-white hover:bg-primary-blue/90 active:bg-primary-blue/80',
    outline: 'border-2 border-primary-pink text-primary-pink hover:bg-primary-pink/10 active:bg-primary-pink/20',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const iconComponent = {
    arrow: <ArrowRight className="ml-2 h-5 w-5" />,
    check: <Check className="ml-2 h-5 w-5" />,
    none: null,
  }

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
    >
      {children}
      {iconComponent[icon]}
    </button>
  )
}



