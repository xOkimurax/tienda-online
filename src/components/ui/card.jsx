const Card = ({ className = '', children, ...props }) => (
  <div
    className={`rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    {...props}
  >
    {children}
  </div>
)

const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-4 py-3 border-b border-gray-100 ${className}`} {...props}>
    {children}
  </div>
)

const CardContent = ({ className = '', children, ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
)

const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`px-4 py-3 border-t border-gray-100 ${className}`} {...props}>
    {children}
  </div>
)

export { Card, CardHeader, CardContent, CardFooter }