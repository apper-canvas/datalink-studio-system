import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { motion } from 'framer-motion'
import Sidebar from '@/components/organisms/Sidebar'
import QueryEditor from '@/components/pages/QueryEditor'
import SchemaExplorer from '@/components/pages/SchemaExplorer'
import ConnectionManager from '@/components/pages/ConnectionManager'
import QueryHistory from '@/components/pages/QueryHistory'
import { useState } from 'react'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeConnection, setActiveConnection] = useState(null)

  return (
    <Router>
      <div className="flex h-screen bg-dark-300 text-slate-100">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: sidebarOpen ? 0 : -280 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 h-full z-50 lg:relative lg:translate-x-0 lg:z-auto"
        >
          <Sidebar 
            activeConnection={activeConnection}
            setActiveConnection={setActiveConnection}
            onClose={() => setSidebarOpen(false)}
          />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-dark-200 border-b border-dark-100 p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DataLink Studio
            </h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-dark-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Routes */}
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route 
                path="/" 
                element={
                  <QueryEditor 
                    activeConnection={activeConnection} 
                    setActiveConnection={setActiveConnection}
                  />
                } 
              />
              <Route 
                path="/query-editor" 
                element={
                  <QueryEditor 
                    activeConnection={activeConnection} 
                    setActiveConnection={setActiveConnection}
                  />
                } 
              />
              <Route 
                path="/schema-explorer" 
                element={
                  <SchemaExplorer 
                    activeConnection={activeConnection}
                  />
                } 
              />
              <Route 
                path="/connections" 
                element={
                  <ConnectionManager 
                    activeConnection={activeConnection}
                    setActiveConnection={setActiveConnection}
                  />
                } 
              />
              <Route path="/history" element={<QueryHistory />} />
            </Routes>
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{ zIndex: 9999 }}
        />
      </div>
    </Router>
  )
}

export default App