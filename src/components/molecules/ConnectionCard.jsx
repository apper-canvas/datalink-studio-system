import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import { formatDistanceToNow } from 'date-fns'

const ConnectionCard = ({ 
  connection, 
  isActive, 
  onConnect, 
  onEdit, 
  onDelete,
  onTest 
}) => {
  const getDatabaseIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'postgresql':
        return 'Database'
      case 'mysql':
        return 'Database'
      case 'sqlite':
        return 'HardDrive'
      default:
        return 'Database'
    }
  }

  const getDatabaseColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'postgresql':
        return 'text-blue-400'
      case 'mysql':
        return 'text-orange-400'
      case 'sqlite':
        return 'text-green-400'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`card-premium p-4 hover:shadow-xl transition-all duration-300 ${
        isActive ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-dark-300 ${getDatabaseColor(connection.type)}`}>
            <ApperIcon name={getDatabaseIcon(connection.type)} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{connection.name}</h3>
            <p className="text-sm text-slate-400">
              {connection.host}:{connection.port}/{connection.database}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isActive ? (
            <Badge variant="success" icon="CheckCircle">
              Connected
            </Badge>
          ) : (
            <div className="w-3 h-3 bg-slate-500 rounded-full" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
        <span className="capitalize">{connection.type}</span>
        {connection.lastUsed && (
          <span>
            Last used {formatDistanceToNow(new Date(connection.lastUsed), { addSuffix: true })}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {!isActive ? (
          <Button 
            variant="primary" 
            size="sm" 
            icon="Play"
            onClick={() => onConnect(connection)}
            className="flex-1"
          >
            Connect
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            icon="CheckCircle"
            disabled
            className="flex-1"
          >
            Active
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          icon="TestTube"
          onClick={() => onTest(connection)}
        >
          Test
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          icon="Edit"
          onClick={() => onEdit(connection)}
        />
        
        <Button 
          variant="ghost" 
          size="sm" 
          icon="Trash2"
          onClick={() => onDelete(connection)}
          className="text-red-400 hover:text-red-300"
        />
      </div>
    </motion.div>
  )
}

export default ConnectionCard