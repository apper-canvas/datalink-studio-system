import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import queryHistoryService from '@/services/api/queryHistoryService'

const QueryHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, success, error

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await queryHistoryService.getAll()
      setHistory(data)
    } catch (error) {
      toast.error('Failed to load query history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const filteredHistory = history.filter(query => {
    const matchesSearch = query.sql.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.connectionName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'success' && !query.error) ||
                         (filterType === 'error' && query.error)
    
    return matchesSearch && matchesFilter
  })

  const copyQuery = (sql) => {
    navigator.clipboard.writeText(sql)
    toast.success('Query copied to clipboard')
  }

  const deleteQuery = async (queryId) => {
    if (window.confirm('Are you sure you want to delete this query from history?')) {
      try {
        await queryHistoryService.delete(queryId)
        setHistory(prev => prev.filter(q => q.Id !== queryId))
        if (selectedQuery?.Id === queryId) {
          setSelectedQuery(null)
        }
        toast.success('Query deleted from history')
      } catch (error) {
        toast.error('Failed to delete query')
      }
    }
  }

  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all query history? This action cannot be undone.')) {
      try {
        for (const query of history) {
          await queryHistoryService.delete(query.Id)
        }
        setHistory([])
        setSelectedQuery(null)
        toast.success('Query history cleared')
      } catch (error) {
        toast.error('Failed to clear history')
      }
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center">
          <ApperIcon name="Loader2" className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading query history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">
              Query History
            </h1>
            <p className="text-slate-400">
              Browse and manage your previously executed queries
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              icon="RefreshCw"
              onClick={loadHistory}
            >
              Refresh
            </Button>
            
            {history.length > 0 && (
              <Button
                variant="outline"
                icon="Trash2"
                onClick={clearHistory}
                className="text-red-400 hover:text-red-300"
              >
                Clear All
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {/* Search */}
            <div className="flex-1 relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              {[
                { value: 'all', label: 'All', count: history.length },
                { value: 'success', label: 'Success', count: history.filter(q => !q.error).length },
                { value: 'error', label: 'Errors', count: history.filter(q => q.error).length }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${filterType === filter.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-200 text-slate-400 hover:text-slate-300 hover:bg-dark-100'
                    }
                  `}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Content */}
        {filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-8 text-center bg-gradient-to-br from-secondary-500/10 to-accent-500/10 border-secondary-500/20"
          >
            <ApperIcon name="History" className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-100 mb-2">
              {history.length === 0 ? 'No Query History' : 'No Matching Queries'}
            </h2>
            <p className="text-slate-400">
              {history.length === 0 
                ? 'Start executing queries to build your history'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </motion.div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
            {/* Query List */}
            <div className="space-y-4 overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-100">
                Recent Queries ({filteredHistory.length})
              </h3>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredHistory.map((query) => (
                    <motion.div
                      key={query.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.02 }}
                      className={`
                        card cursor-pointer transition-all duration-200
                        ${selectedQuery?.Id === query.Id 
                          ? 'ring-2 ring-primary-500 bg-primary-500/10' 
                          : 'hover:bg-dark-100/50'
                        }
                      `}
                      onClick={() => setSelectedQuery(query)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={query.error ? 'error' : 'success'}
                              icon={query.error ? 'AlertCircle' : 'CheckCircle'}
                              size="xs"
                            >
                              {query.error ? 'Error' : 'Success'}
                            </Badge>
                            
                            {query.connectionName && (
                              <Badge variant="outline" size="xs">
                                {query.connectionName}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="Copy"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyQuery(query.sql)
                              }}
                            />
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="Trash2"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteQuery(query.Id)
                              }}
                              className="text-red-400 hover:text-red-300"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <pre className="text-sm text-slate-300 font-mono bg-dark-300 p-2 rounded truncate">
                            {query.sql.length > 100 
                              ? query.sql.substring(0, 100) + '...'
                              : query.sql
                            }
                          </pre>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center space-x-3">
                            {query.executionTime && (
                              <span className="flex items-center space-x-1">
                                <ApperIcon name="Clock" className="w-3 h-3" />
                                <span>{query.executionTime}ms</span>
                              </span>
                            )}
                            
                            {query.rowCount !== null && (
                              <span className="flex items-center space-x-1">
                                <ApperIcon name="BarChart3" className="w-3 h-3" />
                                <span>{query.rowCount} rows</span>
                              </span>
                            )}
                          </div>
                          
                          <span>
                            {formatDistanceToNow(new Date(query.executedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Query Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">
                Query Details
              </h3>
              
              {selectedQuery ? (
                <motion.div
                  key={selectedQuery.Id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card-premium p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={selectedQuery.error ? 'error' : 'success'}
                        icon={selectedQuery.error ? 'AlertCircle' : 'CheckCircle'}
                      >
                        {selectedQuery.error ? 'Failed' : 'Successful'}
                      </Badge>
                      
                      {selectedQuery.connectionName && (
                        <Badge variant="primary">
                          {selectedQuery.connectionName}
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      icon="Copy"
                      onClick={() => copyQuery(selectedQuery.sql)}
                    >
                      Copy Query
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">SQL Query</h4>
                    <pre className="text-sm text-slate-100 font-mono bg-dark-300 p-4 rounded-lg overflow-x-auto">
                      {selectedQuery.sql}
                    </pre>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-300 mb-2">Execution Time</h4>
                      <p className="text-slate-100">
                        {selectedQuery.executionTime ? `${selectedQuery.executionTime}ms` : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-slate-300 mb-2">Rows Affected</h4>
                      <p className="text-slate-100">
                        {selectedQuery.rowCount !== null ? selectedQuery.rowCount : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Executed</h4>
                    <p className="text-slate-100">
                      {new Date(selectedQuery.executedAt).toLocaleString()}
                    </p>
                  </div>

                  {selectedQuery.error && (
                    <div>
                      <h4 className="font-medium text-red-400 mb-2">Error Details</h4>
                      <pre className="text-sm text-red-300 bg-red-900/20 border border-red-500/30 p-4 rounded-lg overflow-x-auto">
                        {selectedQuery.error}
                      </pre>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="card p-8 text-center">
                  <ApperIcon name="MousePointer" className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">
                    Select a query from the list to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QueryHistory