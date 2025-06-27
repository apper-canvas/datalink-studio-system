import { createContext, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { motion } from 'framer-motion'
import { setUser, clearUser } from './store/userSlice'
import Sidebar from '@/components/organisms/Sidebar'
import QueryEditor from '@/components/pages/QueryEditor'
import SchemaExplorer from '@/components/pages/SchemaExplorer'
import ConnectionManager from '@/components/pages/ConnectionManager'
import QueryHistory from '@/components/pages/QueryHistory'
import Login from '@/components/pages/Login'
import Signup from '@/components/pages/Signup'
import Callback from '@/components/pages/Callback'
import ErrorPage from '@/components/pages/ErrorPage'
import ResetPassword from '@/components/pages/ResetPassword'
import PromptPassword from '@/components/pages/PromptPassword'

// Create auth context
export const AuthContext = createContext(null)

function MainApp() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isInitialized, setIsInitialized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeConnection, setActiveConnection] = useState(null)
  
  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user)
  const isAuthenticated = userState?.isAuthenticated || false
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK
    
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true)
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search
        let redirectPath = new URLSearchParams(window.location.search).get('redirect')
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                           currentPath.includes('/callback') || currentPath.includes('/error') || 
                           currentPath.includes('/prompt-password') || currentPath.includes('/reset-password')
        
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath)
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath)
            } else {
              navigate('/')
            }
          } else {
            navigate('/')
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))))
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login'
            )
          } else if (redirectPath) {
            if (
              !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
            ) {
              navigate(`/login?redirect=${redirectPath}`)
            } else {
              navigate(currentPath)
            }
          } else if (isAuthPage) {
            navigate(currentPath)
          } else {
            navigate('/login')
          }
          dispatch(clearUser())
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error)
      }
    })
  }, []) // No props and state should be bound
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK
        await ApperUI.logout()
        dispatch(clearUser())
        navigate('/login')
      } catch (error) {
        console.error("Logout failed:", error)
      }
    }
  }
  
  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="loading flex items-center justify-center p-6 h-full w-full"><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg></div>
  }
  
  // Show authenticated app or auth pages
  if (isAuthenticated) {
    return (
      <AuthContext.Provider value={authMethods}>
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={authMethods.logout}
                  className="p-2 rounded-lg hover:bg-dark-100 transition-colors duration-200 text-red-400 hover:text-red-300"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-dark-100 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
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
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
        <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </AuthContext.Provider>
  )
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  )
}

export default App