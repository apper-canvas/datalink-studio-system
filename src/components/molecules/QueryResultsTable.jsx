import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const QueryResultsTable = ({ results, loading, error }) => {
  const [sortConfig, setSortConfig] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const sortedData = useMemo(() => {
    if (!results?.data || !sortConfig) return results?.data || []
    
    return [...results.data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [results?.data, sortConfig])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil((sortedData?.length || 0) / pageSize)

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current?.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const exportToCSV = () => {
    if (!results?.data || !results?.columns) return
    
    const headers = results.columns.join(',')
    const rows = results.data.map(row => 
      results.columns.map(col => JSON.stringify(row[col] || '')).join(',')
    ).join('\n')
    
    const csv = headers + '\n' + rows
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'query_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    if (!results?.data) return
    
    const json = JSON.stringify(results.data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'query_results.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="card p-8 text-center animate-pulse">
        <ApperIcon name="Loader2" className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Executing query...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 border-red-500/30 bg-red-500/10">
        <div className="flex items-center space-x-3 text-red-400 mb-2">
          <ApperIcon name="AlertCircle" className="w-5 h-5" />
          <h3 className="font-semibold">Query Error</h3>
        </div>
        <pre className="text-sm text-red-300 font-mono bg-red-900/20 p-3 rounded overflow-x-auto">
          {error}
        </pre>
      </div>
    )
  }

  if (!results || !results.data || results.data.length === 0) {
    return (
      <div className="card p-8 text-center">
        <ApperIcon name="Database" className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Results</h3>
        <p className="text-slate-400">
          Execute a query to see results here
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header with export buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-slate-100">
            Query Results
          </h3>
          <span className="text-sm text-slate-400">
            {results.data.length} rows
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            icon="Download"
            onClick={exportToCSV}
          >
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            icon="Download"
            onClick={exportToJSON}
          >
            JSON
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="results-table">
            <thead>
              <tr>
                {results.columns.map((column) => (
                  <th
                    key={column}
                    className="cursor-pointer hover:bg-dark-100 transition-colors duration-150"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column}</span>
                      {sortConfig?.key === column && (
                        <ApperIcon 
                          name={sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                          className="w-4 h-4 text-primary-400" 
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {results.columns.map((column) => (
                    <td key={column}>
                      {row[column] !== null && row[column] !== undefined 
                        ? String(row[column]) 
                        : <span className="text-slate-500 italic">NULL</span>
                      }
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-dark-100">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="input-field w-20 py-1"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon="ChevronLeft"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              
              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                icon="ChevronRight"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default QueryResultsTable