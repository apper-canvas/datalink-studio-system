import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import QueryEditorComponent from '@/components/organisms/QueryEditor'
import QueryResultsTable from '@/components/molecules/QueryResultsTable'
import StatusBar from '@/components/molecules/StatusBar'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import queryService from '@/services/api/queryService'
import queryHistoryService from '@/services/api/queryHistoryService'

const QueryEditor = ({ activeConnection, setActiveConnection }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastQuery, setLastQuery] = useState(null)

  const executeQuery = async (sqlQuery) => {
    if (!activeConnection) {
      toast.error('Please connect to a database first')
      return
    }

    if (!sqlQuery.trim()) {
      toast.warning('Please enter a query to execute')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const result = await queryService.executeQuery(activeConnection.id, sqlQuery)
setResults(result)
      const queryData = {
        sql: sqlQuery,
        executionTime: result.executionTime,
        rowCount: result.data?.length || 0,
        executedAt: new Date().toISOString(),
        error: null,
        connectionId: activeConnection.Id || activeConnection.id,
        connectionName: activeConnection.name
      }
      setLastQuery(queryData)
      
      // Save to database
      try {
        await queryHistoryService.create(queryData)
      } catch (historyError) {
        console.error("Failed to save query history:", historyError)
      }
      
      toast.success(`Query executed successfully. ${result.data?.length || 0} rows returned.`)
    } catch (err) {
      const errorMessage = err.message || 'Failed to execute query'
      setError(errorMessage)
const errorQueryData = {
        sql: sqlQuery,
        executionTime: null,
        rowCount: 0,
        executedAt: new Date().toISOString(),
        error: errorMessage,
        connectionId: activeConnection.Id || activeConnection.id,
        connectionName: activeConnection.name
      }
      setLastQuery(errorQueryData)
      
      // Save error to database
      try {
        await queryHistoryService.create(errorQueryData)
      } catch (historyError) {
        console.error("Failed to save query error history:", historyError)
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadSampleQuery = () => {
    const sampleQueries = [
      "SELECT * FROM users LIMIT 10;",
      "SELECT COUNT(*) as total_records FROM users;",
      "SELECT DISTINCT department FROM employees;",
      "SELECT name, email FROM users WHERE created_at > '2023-01-01';",
      "SHOW TABLES;"
    ]
    
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)]
    setQuery(randomQuery)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Query Editor Section */}
          <div className="flex-1 p-4 space-y-4 min-h-0">
            {/* Welcome Message */}
            {!activeConnection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-premium p-6 text-center bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/20"
              >
                <ApperIcon name="Database" className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-100 mb-2">
                  Welcome to DataLink Studio
                </h2>
                <p className="text-slate-400 mb-4">
                  Connect to a database to start writing and executing SQL queries
                </p>
                <Button
                  variant="primary"
                  icon="Plus"
                  onClick={() => setActiveConnection({ id: 'demo', name: 'Demo Connection', type: 'postgresql', host: 'localhost', port: 5432 })}
                >
                  Connect to Database
                </Button>
              </motion.div>
            )}

            {/* Query Editor */}
            <QueryEditorComponent
              query={query}
              onChange={setQuery}
              onExecute={executeQuery}
              executing={loading}
              disabled={!activeConnection}
            />

            {/* Quick Actions */}
            {activeConnection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  icon="Zap"
                  onClick={loadSampleQuery}
                >
                  Sample Query
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon="Save"
                  disabled={!query.trim()}
                  onClick={() => toast.info('Save functionality coming soon!')}
                >
                  Save Query
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon="History"
                  onClick={() => toast.info('Query history coming soon!')}
                >
                  History
                </Button>
              </motion.div>
            )}
          </div>

          {/* Results Section */}
          <div className="flex-1 p-4 min-h-0 overflow-y-auto">
            <QueryResultsTable 
              results={results}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        activeConnection={activeConnection}
        queryExecuting={loading}
        lastQuery={lastQuery}
        rowCount={results?.data?.length}
      />
    </div>
  )
}

export default QueryEditor