import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import OrdersPage from './pages/OrdersPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import ProviderPage from './pages/ProviderPage'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="provider"
              element={
                <ProtectedRoute requiredRole="PROVIDER">
                  <ProviderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App




