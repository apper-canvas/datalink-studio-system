import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Spinner = ({ 
  size = 'md', 
  className = '',
  text = null
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <ApperIcon 
            name="Loader2" 
            className={`${sizes[size]} text-primary-500 animate-spin`}
          />
        </motion.div>
        {text && (
          <p className="text-sm text-slate-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default Spinner