import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const Sidebar = ({ activeConnection, setActiveConnection, onClose }) => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { path: '/query-editor', icon: 'Code', label: 'Query Editor' },
    { path: '/schema-explorer', icon: 'TreePine', label: 'Schema Explorer' },
    { path: '/connections', icon: 'Database', label: 'Connections' },
    { path: '/history', icon: 'History', label: 'Query History' }
  ]

  const disconnectConnection = () => {
    setActiveConnection(null)
  }

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={`
        h-full bg-gradient-dark border-r border-dark-100 flex flex-col
        ${collapsed ? 'w-16' : 'w-70'}
        transition-all duration-300
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                DataLink Studio
              </h1>
              <p className="text-sm text-slate-400 mt-1">Database Management</p>
            </motion.div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={collapsed ? 'ChevronRight' : 'ChevronLeft'}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex"
            />
            
            <Button
              variant="ghost"
              size="sm"
              icon="X"
              onClick={onClose}
              className="lg:hidden"
            />
          </div>
        </div>
      </div>

      {/* Active Connection */}
      <AnimatePresence>
        {activeConnection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-dark-100 bg-primary-500/10"
          >
            {!collapsed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                    Active Connection
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="X"
                    onClick={disconnectConnection}
                    className="text-slate-400 hover:text-red-400"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="connection-status-active" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-100 truncate">
                      {activeConnection.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {activeConnection.host}:{activeConnection.port}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="connection-status-active" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                : 'text-slate-400 hover:text-slate-300 hover:bg-dark-100'
              }
            `}
          >
            <ApperIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-100">
        {!collapsed ? (
          <div className="text-center">
            <p className="text-xs text-slate-500">
              DataLink Studio v1.0
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Professional Database Tool
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <ApperIcon name="Info" className="w-4 h-4 text-slate-500" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Sidebar