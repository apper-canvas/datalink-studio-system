import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'

const SchemaTree = ({ schema, loading, onRefresh }) => {
  const [expandedTables, setExpandedTables] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const toggleTable = (tableName) => {
    setExpandedTables(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tableName)) {
        newSet.delete(tableName)
      } else {
        newSet.add(tableName)
      }
      return newSet
    })
  }

  const getDataTypeIcon = (dataType) => {
    const type = dataType?.toLowerCase() || ''
    if (type.includes('int') || type.includes('number')) return 'Hash'
    if (type.includes('varchar') || type.includes('text') || type.includes('char')) return 'Type'
    if (type.includes('date') || type.includes('time')) return 'Calendar'
    if (type.includes('bool')) return 'ToggleLeft'
    if (type.includes('json')) return 'Braces'
    return 'Minus'
  }

  const getDataTypeColor = (dataType) => {
    const type = dataType?.toLowerCase() || ''
    if (type.includes('int') || type.includes('number')) return 'text-blue-400'
    if (type.includes('varchar') || type.includes('text') || type.includes('char')) return 'text-green-400'
    if (type.includes('date') || type.includes('time')) return 'text-purple-400'
    if (type.includes('bool')) return 'text-yellow-400'
    if (type.includes('json')) return 'text-orange-400'
    return 'text-slate-400'
  }

  const filteredTables = schema?.tables?.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.columns?.some(col => 
      col.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || []

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <ApperIcon name="Loader2" className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading schema...</p>
      </div>
    )
  }

  if (!schema || !schema.tables || schema.tables.length === 0) {
    return (
      <div className="card p-8 text-center">
        <ApperIcon name="TreePine" className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Schema Available</h3>
        <p className="text-slate-400 mb-4">
          Connect to a database to explore its schema
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn-primary"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
            Refresh Schema
          </button>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
          <ApperIcon name="TreePine" className="w-5 h-5 text-primary-400" />
          <span>Database Schema</span>
        </h3>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-dark-100 transition-colors duration-200 text-slate-400 hover:text-slate-300"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search tables and columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Schema Tree */}
      <div className="card space-y-1 max-h-96 overflow-y-auto">
        {filteredTables.map((table) => (
          <div key={table.name} className="border-b border-dark-100 last:border-b-0">
            {/* Table Header */}
            <button
              onClick={() => toggleTable(table.name)}
              className="w-full flex items-center justify-between p-3 hover:bg-dark-100 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3">
                <ApperIcon 
                  name={expandedTables.has(table.name) ? 'ChevronDown' : 'ChevronRight'} 
                  className="w-4 h-4 text-slate-400" 
                />
                <ApperIcon name="Table" className="w-4 h-4 text-primary-400" />
                <span className="font-medium text-slate-100">{table.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" size="xs">
                  {table.columns?.length || 0} columns
                </Badge>
                {table.rowCount && (
                  <Badge variant="outline" size="xs">
                    {table.rowCount} rows
                  </Badge>
                )}
              </div>
            </button>

            {/* Table Columns */}
            <AnimatePresence>
              {expandedTables.has(table.name) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-dark-300/50"
                >
                  {table.columns?.map((column) => (
                    <div
                      key={column.name}
                      className="flex items-center justify-between px-6 py-2 hover:bg-dark-100/50 transition-colors duration-150"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6" /> {/* Indentation spacer */}
                        <ApperIcon 
                          name={getDataTypeIcon(column.dataType)} 
                          className={`w-3 h-3 ${getDataTypeColor(column.dataType)}`}
                        />
                        <span className="text-sm text-slate-300">{column.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={`font-mono ${getDataTypeColor(column.dataType)}`}>
                          {column.dataType}
                        </span>
                        {column.isPrimaryKey && (
                          <Badge variant="primary" size="xs" icon="Key">
                            PK
                          </Badge>
                        )}
                        {column.isForeignKey && (
                          <Badge variant="secondary" size="xs" icon="Link">
                            FK
                          </Badge>
                        )}
                        {!column.nullable && (
                          <Badge variant="warning" size="xs">
                            NOT NULL
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Schema Stats */}
      {schema.tables && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="card p-4">
            <div className="text-2xl font-bold text-primary-400">
              {schema.tables.length}
            </div>
            <div className="text-sm text-slate-400">Tables</div>
          </div>
          
          <div className="card p-4">
            <div className="text-2xl font-bold text-secondary-400">
              {schema.views?.length || 0}
            </div>
            <div className="text-sm text-slate-400">Views</div>
          </div>
          
          <div className="card p-4">
            <div className="text-2xl font-bold text-accent-400">
              {schema.procedures?.length || 0}
            </div>
            <div className="text-sm text-slate-400">Procedures</div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default SchemaTree