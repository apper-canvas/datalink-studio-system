import { motion } from 'framer-motion'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'

const StatusBar = ({ 
  activeConnection, 
  queryExecuting = false,
  lastQuery = null,
  rowCount = null 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-200 border-t border-dark-100 px-4 py-2"
    >
      <div className="flex items-center justify-between">
        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          {activeConnection ? (
            <div className="flex items-center space-x-2">
              <div className="connection-status-active" />
              <span className="text-sm text-slate-300">
                Connected to <strong>{activeConnection.name}</strong>
              </span>
              <Badge variant="success" size="xs">
                {activeConnection.type}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="connection-status-inactive" />
              <span className="text-sm text-slate-400">
                No active connection
              </span>
            </div>
          )}
        </div>

        {/* Query Status */}
        <div className="flex items-center space-x-4">
          {queryExecuting && (
            <div className="flex items-center space-x-2">
              <ApperIcon name="Loader2" className="w-4 h-4 text-primary-500 animate-spin" />
              <span className="text-sm text-slate-400">Executing query...</span>
            </div>
          )}

          {lastQuery && !queryExecuting && (
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              {lastQuery.executionTime && (
                <div className="flex items-center space-x-1">
                  <ApperIcon name="Clock" className="w-4 h-4" />
                  <span>{lastQuery.executionTime}ms</span>
                </div>
              )}
              
              {rowCount !== null && (
                <div className="flex items-center space-x-1">
                  <ApperIcon name="BarChart3" className="w-4 h-4" />
                  <span>{rowCount} rows</span>
                </div>
              )}
              
              {lastQuery.error && (
                <Badge variant="error" icon="AlertCircle" size="xs">
                  Error
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default StatusBar