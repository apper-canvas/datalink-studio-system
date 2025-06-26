import { forwardRef } from 'react'
import ApperIcon from '@/components/ApperIcon'

const Input = forwardRef(({ 
  label,
  type = 'text',
  placeholder,
  icon,
  error,
  helperText,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon 
              name={icon} 
              className="w-4 h-4 text-slate-400" 
            />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 bg-dark-300 border text-slate-100 placeholder-slate-400 rounded-lg 
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-dark-100 focus:ring-primary-500'
            }
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-400 flex items-center mt-1">
          <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-slate-400 mt-1">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input