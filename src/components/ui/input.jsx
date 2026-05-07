import { forwardRef } from 'react'

const Input = forwardRef(({
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={`
        w-full px-4 py-2 rounded-full border border-hairline
        text-ink placeholder-ink-muted
        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
        disabled:bg-parchment disabled:cursor-not-allowed font-sf-text
        ${className}
      `}
      {...props}
    />
  )
})

Input.displayName = 'Input'

const Label = forwardRef(({ className = '', children, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium text-ink font-sf-text ${className}`}
    {...props}
  >
    {children}
  </label>
))

Label.displayName = 'Label'

export { Input, Label }