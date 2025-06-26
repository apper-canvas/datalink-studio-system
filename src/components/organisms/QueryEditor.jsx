import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const QueryEditor = ({ 
  query = '', 
  onChange, 
  onExecute, 
  executing = false,
  disabled = false 
}) => {
  const [localQuery, setLocalQuery] = useState(query)
  const [selectedText, setSelectedText] = useState('')

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  const handleChange = (e) => {
    const value = e.target.value
    setLocalQuery(value)
    if (onChange) onChange(value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const value = e.target.value
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      setLocalQuery(newValue)
      if (onChange) onChange(newValue)
      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2
      }, 0)
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (onExecute && !executing && !disabled) {
        onExecute(selectedText || localQuery)
      }
    }
  }

  const handleSelection = (e) => {
    const selection = e.target.value.substring(
      e.target.selectionStart,
      e.target.selectionEnd
    )
    setSelectedText(selection.trim())
  }

  const formatQuery = () => {
    // Basic SQL formatting
    const formatted = localQuery
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bLIMIT\b/gi, '\nLIMIT')
    
    setLocalQuery(formatted)
    if (onChange) onChange(formatted)
  }

  const clearQuery = () => {
    setLocalQuery('')
    if (onChange) onChange('')
    setSelectedText('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
          <ApperIcon name="Code" className="w-5 h-5 text-primary-400" />
          <span>SQL Query Editor</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon="Type"
            onClick={formatQuery}
            disabled={!localQuery.trim() || executing}
          >
            Format
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            icon="Trash2"
            onClick={clearQuery}
            disabled={!localQuery.trim() || executing}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={localQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelection}
          placeholder="-- Enter your SQL query here
-- Use Ctrl+Enter (Cmd+Enter on Mac) to execute
-- Select text to run only selected portion

SELECT * FROM users WHERE id = 1;"
          disabled={disabled || executing}
          className={`
            w-full h-64 query-editor resize-none focus:ring-2 focus:ring-primary-500
            ${disabled || executing ? 'opacity-50 cursor-not-allowed' : ''}
            ${executing ? 'animate-pulse' : ''}
          `}
        />
        
        {executing && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-300/50 rounded-lg">
            <div className="flex items-center space-x-2 bg-dark-200 px-4 py-2 rounded-lg border border-dark-100">
              <ApperIcon name="Loader2" className="w-4 h-4 text-primary-500 animate-spin" />
              <span className="text-sm text-slate-400">Executing query...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <span>Lines: {localQuery.split('\n').length}</span>
          <span>Characters: {localQuery.length}</span>
          {selectedText && (
            <span className="text-primary-400">
              Selected: {selectedText.length} chars
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            icon="Play"
            onClick={() => onExecute && onExecute(selectedText || localQuery)}
            disabled={!localQuery.trim() || executing || disabled}
            loading={executing}
          >
            {selectedText ? 'Run Selected' : 'Execute Query'}
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-slate-500 border-t border-dark-100 pt-3">
        <div className="flex flex-wrap gap-4">
          <span><kbd className="bg-dark-300 px-1 rounded">Ctrl+Enter</kbd> Execute</span>
          <span><kbd className="bg-dark-300 px-1 rounded">Tab</kbd> Indent</span>
          <span><kbd className="bg-dark-300 px-1 rounded">Ctrl+A</kbd> Select All</span>
        </div>
      </div>
    </motion.div>
  )
}

export default QueryEditor