import ApperIcon from '@/components/ApperIcon'

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  icon,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const variants = {
    default: 'bg-slate-600 text-slate-100',
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    outline: 'border border-slate-300 text-slate-300'
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm'
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <span className={classes} {...props}>
      {icon && (
        <ApperIcon 
          name={icon} 
          className="w-3 h-3 mr-1" 
        />
      )}
      {children}
    </span>
  )
}

export default Badge