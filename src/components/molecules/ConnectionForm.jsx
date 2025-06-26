import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ApperIcon from '@/components/ApperIcon'

const ConnectionForm = ({ 
  connection = null, 
  onSave, 
  onCancel, 
  onTest,
  testing = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (connection) {
      setFormData({
        name: connection.name || '',
        type: connection.type || 'postgresql',
        host: connection.host || 'localhost',
        port: connection.port || 5432,
        database: connection.database || '',
        username: connection.username || '',
        password: connection.password || ''
      })
    }
  }, [connection])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleTypeChange = (type) => {
    const defaultPorts = {
      postgresql: 5432,
      mysql: 3306,
      sqlite: null
    }
    
    setFormData(prev => ({
      ...prev,
      type,
      port: defaultPorts[type] || 5432
    }))
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Connection name is required'
    }
    
    if (!formData.host.trim() && formData.type !== 'sqlite') {
      newErrors.host = 'Host is required'
    }
    
    if (!formData.database.trim()) {
      newErrors.database = 'Database name is required'
    }
    
    if (!formData.username.trim() && formData.type !== 'sqlite') {
      newErrors.username = 'Username is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  const handleTest = () => {
    if (validate()) {
      onTest(formData)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          {connection ? 'Edit Connection' : 'New Connection'}
        </h3>
      </div>

      {/* Connection Name */}
      <Input
        label="Connection Name"
        placeholder="My Database Connection"
        icon="Database"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
      />

      {/* Database Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Database Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'postgresql', label: 'PostgreSQL', icon: 'Database' },
            { value: 'mysql', label: 'MySQL', icon: 'Database' },
            { value: 'sqlite', label: 'SQLite', icon: 'HardDrive' }
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleTypeChange(type.value)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2
                ${formData.type === type.value
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-dark-100 hover:border-primary-400 text-slate-400 hover:text-slate-300'
                }
              `}
            >
              <ApperIcon name={type.icon} className="w-6 h-6" />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Connection Details */}
      {formData.type !== 'sqlite' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Host"
            placeholder="localhost"
            icon="Server"
            value={formData.host}
            onChange={(e) => handleChange('host', e.target.value)}
            error={errors.host}
          />
          
          <Input
            label="Port"
            type="number"
            placeholder="5432"
            icon="Hash"
            value={formData.port}
            onChange={(e) => handleChange('port', parseInt(e.target.value) || '')}
            error={errors.port}
          />
        </div>
      )}

      <Input
        label="Database"
        placeholder={formData.type === 'sqlite' ? '/path/to/database.db' : 'database_name'}
        icon={formData.type === 'sqlite' ? 'FolderOpen' : 'Database'}
        value={formData.database}
        onChange={(e) => handleChange('database', e.target.value)}
        error={errors.database}
      />

      {formData.type !== 'sqlite' && (
        <>
          <Input
            label="Username"
            placeholder="username"
            icon="User"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            error={errors.username}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="password"
            icon="Lock"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
          />
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-100">
        <Button
          type="button"
          variant="outline"
          icon="TestTube"
          onClick={handleTest}
          loading={testing}
        >
          Test Connection
        </Button>
        
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            icon="Save"
          >
            {connection ? 'Update' : 'Save'} Connection
          </Button>
        </div>
      </div>
    </motion.form>
  )
}

export default ConnectionForm