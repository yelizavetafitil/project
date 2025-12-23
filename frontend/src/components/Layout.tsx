import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, ShoppingBag, User, LogOut } from 'lucide-react'

export default function Layout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const username = useAuthStore((state) => state.username)
  const role = useAuthStore((state) => state.role)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }
  
  const isAuth = isAuthenticated()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 py-2 text-xl font-bold text-primary-600">
                <Home className="mr-2" />
                Услуги на дом
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/services"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                >
                  <ShoppingBag className="mr-1" size={18} />
                  Услуги
                </Link>
                {isAuth && (role === 'CUSTOMER' || role === 'PROVIDER') && (
                  <Link
                    to="/orders"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                  >
                    Мои заказы
                  </Link>
                )}
                {isAuth && role === 'PROVIDER' && (
                  <Link
                    to="/provider"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                  >
                    Мои услуги
                  </Link>
                )}
                {isAuth && role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                  >
                    Админ-панель
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {isAuth ? (
                <>
                  <Link
                    to="/profile"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    <User className="mr-2" size={18} />
                    {username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <LogOut className="mr-2" size={18} />
                    Выход
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Войти
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}




