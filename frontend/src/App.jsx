import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AdminPanel from './pages/AdminPanel'
import LoginPage from './pages/LoginPage'
import CustomerPortal from './pages/CustomerPortal'

function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const adminUser = localStorage.getItem('adminUser')
    if (adminUser) {
      try {
        const userData = JSON.parse(adminUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (err) {
        console.error('Failed to parse user data:', err)
        localStorage.removeItem('adminUser')
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('adminUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('adminUser')
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f4f6fb', fontSize: '18px', color: '#64748b' }}>Loading...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminPanel user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route path="/portal" element={<CustomerPortal />} />
    </Routes>
  )
}
