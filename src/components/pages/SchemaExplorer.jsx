import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import SchemaTree from '@/components/organisms/SchemaTree'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import schemaService from '@/services/api/schemaService'

const SchemaExplorer = ({ activeConnection }) => {
  const [schema, setSchema] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)

  const loadSchema = async () => {
    if (!activeConnection) {
      toast.error('Please connect to a database first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const schemaData = await schemaService.getSchema(activeConnection.id)
      setSchema(schemaData)
      toast.success('Schema loaded successfully')
    } catch (err) {
      const errorMessage = err.message || 'Failed to load schema'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeConnection) {
      loadSchema()
    }
  }, [activeConnection])

  const generateSelectQuery = (tableName) => {
    const query = `SELECT * FROM ${tableName} LIMIT 100;`
    navigator.clipboard.writeText(query)
    toast.success('SELECT query copied to clipboard')
  }

  const generateInsertQuery = (table) => {
    if (!table.columns) return
    
    const columns = table.columns.map(col => col.name).join(', ')
    const values = table.columns.map(col => {
      const type = col.dataType?.toLowerCase() || ''
      if (type.includes('int') || type.includes('number')) return '0'
      if (type.includes('bool')) return 'true'
      if (type.includes('date')) return "'2023-01-01'"
      return "'value'"
    }).join(', ')
    
    const query = `INSERT INTO ${table.name} (${columns}) VALUES (${values});`
    navigator.clipboard.writeText(query)
    toast.success('INSERT query template copied to clipboard')
  }

  if (!activeConnection) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 text-center bg-gradient-to-br from-secondary-500/10 to-accent-500/10 border-secondary-500/20"
        >
          <ApperIcon name="TreePine" className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            No Database Connected
          </h2>
          <p className="text-slate-400 mb-4">
            Connect to a database to explore its schema and structure
          </p>
          <Button variant="secondary" icon="Database">
            Go to Connections
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">
              Schema Explorer
            </h1>
            <p className="text-slate-400">
              Explore the structure of <span className="text-primary-400 font-medium">
                {activeConnection.name}
              </span>
            </p>
          </div>
          
          <Button
            variant="primary"
            icon="RefreshCw"
            onClick={loadSchema}
            loading={loading}
          >
            Refresh Schema
          </Button>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schema Tree */}
          <div className="lg:col-span-2">
            <SchemaTree
              schema={schema}
              loading={loading}
              onRefresh={loadSchema}
            />
          </div>

          {/* Table Details */}
          <div className="space-y-4">
            {selectedTable ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-premium p-6"
              >
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center space-x-2">
                  <ApperIcon name="Table" className="w-5 h-5 text-primary-400" />
                  <span>{selectedTable.name}</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon="Copy"
                        onClick={() => generateSelectQuery(selectedTable.name)}
                        className="w-full justify-start"
                      >
                        Copy SELECT Query
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        icon="Copy"
                        onClick={() => generateInsertQuery(selectedTable)}
                        className="w-full justify-start"
                      >
                        Copy INSERT Template
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Table Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Columns:</span>
                        <span className="text-slate-100">{selectedTable.columns?.length || 0}</span>
                      </div>
                      
                      {selectedTable.rowCount && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rows:</span>
                          <span className="text-slate-100">{selectedTable.rowCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="card p-6 text-center">
                <ApperIcon name="MousePointer" className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">
                  Click on a table to see details and quick actions
                </p>
              </div>
            )}

            {/* Schema Summary */}
            {schema && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-premium p-6"
              >
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center space-x-2">
                  <ApperIcon name="BarChart3" className="w-5 h-5 text-accent-400" />
                  <span>Schema Summary</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Table" className="w-4 h-4 text-primary-400" />
                      <span className="text-slate-300">Tables</span>
                    </div>
                    <span className="font-semibold text-primary-400">
                      {schema.tables?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Eye" className="w-4 h-4 text-secondary-400" />
                      <span className="text-slate-300">Views</span>
                    </div>
                    <span className="font-semibold text-secondary-400">
                      {schema.views?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Zap" className="w-4 h-4 text-accent-400" />
                      <span className="text-slate-300">Procedures</span>
                    </div>
                    <span className="font-semibold text-accent-400">
                      {schema.procedures?.length || 0}
                    </span>
                  </div>

                  {schema.lastRefreshed && (
                    <div className="pt-2 border-t border-dark-100 text-xs text-slate-500">
                      Last updated: {new Date(schema.lastRefreshed).toLocaleString()}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchemaExplorer