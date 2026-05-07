import { forwardRef } from 'react'

const buttonVariants = {
  primary: 'bg-primary text-white hover:bg-primary-focus disabled:opacity-50',
  secondary: 'bg-parchment text-ink hover:bg-hairline disabled:opacity-50',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50',
  ghost: 'text-primary hover:bg-parchment disabled:opacity-50',
  destructive: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
}

const buttonSizes = {
  sm: 'px-4 py-2 text-sm rounded-full',
  md: 'px-5 py-2.5 text-sm rounded-full',
  lg: 'px-6 py-3 text-base rounded-full',
  icon: 'p-2 rounded-full',
}

const Button = forwardRef(({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:cursor-not-allowed font-sf-text
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }