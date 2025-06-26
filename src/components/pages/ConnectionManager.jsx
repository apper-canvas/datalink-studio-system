import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ConnectionCard from '@/components/molecules/ConnectionCard'
import ConnectionForm from '@/components/molecules/ConnectionForm'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import connectionService from '@/services/api/connectionService'

const ConnectionManager = ({ activeConnection, setActiveConnection }) => {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState(null)
  const [testingConnection, setTestingConnection] = useState(null)

  const loadConnections = async () => {
    setLoading(true)
    try {
      const data = await connectionService.getAll()
      setConnections(data)
    } catch (error) {
      toast.error('Failed to load connections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnections()
  }, [])

  const handleConnect = async (connection) => {
    try {
      const updatedConnection = await connectionService.connect(connection.Id)
      setActiveConnection(updatedConnection)
      toast.success(`Connected to ${connection.name}`)
      
      // Update last used timestamp
      const updated = await connectionService.update(connection.Id, {
        ...connection,
        lastUsed: new Date().toISOString()
      })
      
      setConnections(prev => 
        prev.map(conn => conn.Id === connection.Id ? updated : conn)
      )
    } catch (error) {
      toast.error(`Failed to connect to ${connection.name}: ${error.message}`)
    }
  }

  const handleEdit = (connection) => {
    setEditingConnection(connection)
    setShowForm(true)
  }

  const handleDelete = async (connection) => {
    if (window.confirm(`Are you sure you want to delete "${connection.name}"?`)) {
      try {
        await connectionService.delete(connection.Id)
        setConnections(prev => prev.filter(conn => conn.Id !== connection.Id))
        
        if (activeConnection?.Id === connection.Id) {
          setActiveConnection(null)
        }
        
        toast.success(`Connection "${connection.name}" deleted`)
      } catch (error) {
        toast.error('Failed to delete connection')
      }
    }
  }

  const handleTest = async (connection) => {
    setTestingConnection(connection.Id)
    try {
      await connectionService.testConnection(connection)
      toast.success(`Connection to ${connection.name} successful!`)
    } catch (error) {
      toast.error(`Connection test failed: ${error.message}`)
    } finally {
      setTestingConnection(null)
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editingConnection) {
        const updated = await connectionService.update(editingConnection.Id, formData)
        setConnections(prev => 
          prev.map(conn => conn.Id === editingConnection.Id ? updated : conn)
        )
        toast.success('Connection updated successfully')
      } else {
        const newConnection = await connectionService.create(formData)
        setConnections(prev => [...prev, newConnection])
        toast.success('Connection created successfully')
      }
      
      setShowForm(false)
      setEditingConnection(null)
    } catch (error) {
      toast.error('Failed to save connection: ' + error.message)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingConnection(null)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center">
          <ApperIcon name="Loader2" className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading connections...</p>
        </div>
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
              Database Connections
            </h1>
            <p className="text-slate-400">
              Manage your database connections and connect to different databases
            </p>
          </div>
          
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setShowForm(true)}
          >
            New Connection
          </Button>
        </motion.div>

        {/* Connection Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="card-premium p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <ConnectionForm
                  connection={editingConnection}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onTest={handleTest}
                  testing={testingConnection === editingConnection?.Id}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connections Grid */}
        {connections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-8 text-center bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/20"
          >
            <ApperIcon name="Database" className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-100 mb-2">
              No Connections Yet
            </h2>
            <p className="text-slate-400 mb-6">
              Create your first database connection to get started
            </p>
            <Button
              variant="primary"
              icon="Plus"
              onClick={() => setShowForm(true)}
            >
              Create First Connection
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {connections.map((connection) => (
                <ConnectionCard
                  key={connection.Id}
                  connection={connection}
                  isActive={activeConnection?.Id === connection.Id}
                  onConnect={handleConnect}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTest={handleTest}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Connection Stats */}
        {connections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="card-premium p-4 text-center">
              <div className="text-2xl font-bold text-primary-400 mb-1">
                {connections.length}
              </div>
              <div className="text-sm text-slate-400">Total Connections</div>
            </div>
            
            <div className="card-premium p-4 text-center">
              <div className="text-2xl font-bold text-accent-400 mb-1">
                {activeConnection ? 1 : 0}
              </div>
              <div className="text-sm text-slate-400">Active</div>
            </div>
            
            <div className="card-premium p-4 text-center">
              <div className="text-2xl font-bold text-secondary-400 mb-1">
                {connections.filter(c => c.type === 'postgresql').length}
              </div>
              <div className="text-sm text-slate-400">PostgreSQL</div>
            </div>
            
            <div className="card-premium p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {connections.filter(c => c.type === 'mysql').length}
              </div>
              <div className="text-sm text-slate-400">MySQL</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ConnectionManager