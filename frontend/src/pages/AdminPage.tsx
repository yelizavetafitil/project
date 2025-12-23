import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, Order, categoryApi } from '../api/services'
import { 
  Users, ShoppingBag, Package, BarChart3, 
  Trash2, TrendingUp, Plus, X as XIcon, Search, Filter
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const statusLabels: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтвержден',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершен',
  CANCELLED: 'Отменен',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'services' | 'orders'>('stats')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreateService, setShowCreateService] = useState(false)
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  
  // Фильтры для Users
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL')
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL')
  const [userSearch, setUserSearch] = useState('')
  
  // Фильтры для Services
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('ALL')
  const [serviceStatusFilter, setServiceStatusFilter] = useState<string>('ALL')
  const [serviceSearch, setServiceSearch] = useState('')
  
  // Фильтры для Orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL')
  const [orderSearch, setOrderSearch] = useState('')
  
  const queryClient = useQueryClient()

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await adminApi.getStats()
      return response.data
    },
  })

  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await adminApi.getAllUsers()
      return response.data
    },
    enabled: activeTab === 'users',
  })

  const { data: services } = useQuery({
    queryKey: ['admin', 'services'],
    queryFn: async () => {
      const response = await adminApi.getAllServices()
      return response.data
    },
    enabled: activeTab === 'services',
  })

  const { data: orders } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const response = await adminApi.getAllOrders()
      return response.data
    },
    enabled: activeTab === 'orders',
  })

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminApi.updateUserStatus(id, active),
    onSuccess: () => {
      toast.success('Статус пользователя обновлен')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при обновлении статуса'),
  })

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      toast.success('Роль пользователя обновлена')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при обновлении роли'),
  })

  const deleteUserMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      toast.success('Пользователь удален')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при удалении пользователя'),
  })

  const updateServiceStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminApi.updateServiceStatus(id, active),
    onSuccess: () => {
      toast.success('Статус услуги обновлен')
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при обновлении статуса'),
  })

  const deleteServiceMutation = useMutation({
    mutationFn: adminApi.deleteService,
    onSuccess: () => {
      toast.success('Услуга удалена')
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при удалении услуги'),
  })

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Статус заказа обновлен')
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при обновлении статуса'),
  })

  const deleteOrderMutation = useMutation({
    mutationFn: adminApi.deleteOrder,
    onSuccess: () => {
      toast.success('Заказ удален')
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при удалении заказа'),
  })

  const createUserMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      toast.success('Пользователь создан')
      setShowCreateUser(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при создании пользователя'),
  })

  const createServiceMutation = useMutation({
    mutationFn: adminApi.createService,
    onSuccess: () => {
      toast.success('Услуга создана')
      setShowCreateService(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при создании услуги'),
  })

  const createOrderMutation = useMutation({
    mutationFn: ({ data, customerId }: { data: any; customerId: number }) =>
      adminApi.createOrder(data, customerId),
    onSuccess: () => {
      toast.success('Заказ создан')
      setShowCreateOrder(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Ошибка при создании заказа'),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryApi.getAll()
      return response.data
    },
  })

  // Загружаем пользователей для выпадающих списков
  const { data: allUsers } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await adminApi.getAllUsers()
      return response.data
    },
  })

  // Загружаем услуги для выпадающего списка
  const { data: allServices } = useQuery({
    queryKey: ['admin', 'services'],
    queryFn: async () => {
      const response = await adminApi.getAllServices()
      return response.data
    },
  })

  // Фильтруем пользователей по ролям
  const providers = allUsers?.filter((u) => u.role === 'PROVIDER') || []
  const customers = allUsers?.filter((u) => u.role === 'CUSTOMER') || []

  // Фильтрация пользователей
  const filteredUsers = users?.filter((user) => {
    if (userRoleFilter !== 'ALL' && user.role !== userRoleFilter) return false
    if (userStatusFilter !== 'ALL') {
      const isActive = user.active !== false
      if (userStatusFilter === 'ACTIVE' && !isActive) return false
      if (userStatusFilter === 'INACTIVE' && isActive) return false
    }
    if (userSearch) {
      const search = userSearch.toLowerCase()
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      if (!fullName.includes(search) && !user.email.toLowerCase().includes(search) && !user.username.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  }) || []

  // Фильтрация услуг
  const filteredServices = services?.filter((service) => {
    if (serviceCategoryFilter !== 'ALL' && service.categoryId !== Number(serviceCategoryFilter)) return false
    if (serviceStatusFilter !== 'ALL') {
      const isActive = service.active !== false
      if (serviceStatusFilter === 'ACTIVE' && !isActive) return false
      if (serviceStatusFilter === 'INACTIVE' && isActive) return false
    }
    if (serviceSearch) {
      const search = serviceSearch.toLowerCase()
      if (!service.name.toLowerCase().includes(search) && 
          !service.description?.toLowerCase().includes(search) &&
          !service.categoryName?.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  }) || []

  // Фильтрация заказов
  const filteredOrders = orders?.filter((order) => {
    if (orderStatusFilter !== 'ALL' && order.status !== orderStatusFilter) return false
    if (orderSearch) {
      const search = orderSearch.toLowerCase()
      if (!order.serviceName?.toLowerCase().includes(search) &&
          !order.customerName?.toLowerCase().includes(search) &&
          !order.providerName?.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  }) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Панель администратора</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="inline mr-2" size={18} />
            Статистика
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="inline mr-2" size={18} />
            Пользователи
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingBag className="inline mr-2" size={18} />
            Услуги
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="inline mr-2" size={18} />
            Заказы
          </button>
        </nav>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="text-blue-500" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBag className="text-green-500" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего услуг</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="text-purple-500" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="text-yellow-500" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общая выручка</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRevenue.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Поиск пользователей..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-500" size={20} />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ALL">Все роли</option>
                  <option value="CUSTOMER">Клиент</option>
                  <option value="PROVIDER">Исполнитель</option>
                  <option value="ADMIN">Администратор</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ALL">Все статусы</option>
                  <option value="ACTIVE">Активные</option>
                  <option value="INACTIVE">Неактивные</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowCreateUser(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="mr-2" size={18} />
              Создать пользователя
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id || `user-${user.email}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => user.id !== undefined && updateUserRoleMutation.mutate({ id: user.id, role: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white"
                    >
                      <option value="CUSTOMER">Клиент</option>
                      <option value="PROVIDER">Исполнитель</option>
                      <option value="ADMIN">Администратор</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id !== undefined && (
                      <button
                        onClick={() => updateUserStatusMutation.mutate({ id: user.id!, active: !user.active })}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.active ? 'Активен' : 'Неактивен'}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.id !== undefined && (
                      <button
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                            deleteUserMutation.mutate(user.id!)
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Поиск услуг..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-500" size={20} />
                <select
                  value={serviceCategoryFilter}
                  onChange={(e) => setServiceCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ALL">Все категории</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={serviceStatusFilter}
                  onChange={(e) => setServiceStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ALL">Все статусы</option>
                  <option value="ACTIVE">Активные</option>
                  <option value="INACTIVE">Неактивные</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowCreateService(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="mr-2" size={18} />
              Создать услугу
            </button>
          </div>
          <div className="space-y-4">
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">Услуги не найдены</p>
              </div>
            ) : (
              filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-gray-600 mt-1">{service.description}</p>
                    <p className="text-primary-600 font-bold mt-2">
                      {service.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {service.id && (
                      <>
                        <button
                          onClick={() =>
                            updateServiceStatusMutation.mutate({ id: service.id, active: !service.active })
                          }
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            service.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {service.active ? 'Активна' : 'Неактивна'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
                              deleteServiceMutation.mutate(service.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Поиск заказов..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-500" size={20} />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ALL">Все статусы</option>
                  <option value="PENDING">Ожидают</option>
                  <option value="CONFIRMED">Подтверждены</option>
                  <option value="IN_PROGRESS">В работе</option>
                  <option value="COMPLETED">Завершены</option>
                  <option value="CANCELLED">Отменены</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowCreateOrder(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="mr-2" size={18} />
              Создать заказ
            </button>
          </div>
          <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">Заказы не найдены</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.serviceName}</h3>
                  <p className="text-gray-600 mt-1">Клиент: {order.customerName}</p>
                  <p className="text-gray-600">
                    {new Date(order.scheduledDateTime).toLocaleString('ru-RU')}
                  </p>
                  <p className="text-primary-600 font-bold mt-2">
                    {order.totalPrice.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatusMutation.mutate({
                        id: order.id,
                        status: e.target.value as Order['status'],
                      })
                    }
                    className="border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white"
                  >
                    <option value="PENDING">Ожидает</option>
                    <option value="CONFIRMED">Подтвержден</option>
                    <option value="IN_PROGRESS">В работе</option>
                    <option value="COMPLETED">Завершен</option>
                    <option value="CANCELLED">Отменен</option>
                  </select>
                  <button
                    onClick={() => {
                      if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
                        deleteOrderMutation.mutate(order.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}
              >
                {statusLabels[order.status]}
              </span>
            </div>
            ))
          )}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Создать пользователя</h2>
              <button onClick={() => setShowCreateUser(false)}>
                <XIcon size={24} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                createUserMutation.mutate({
                  username: formData.get('username') as string,
                  email: formData.get('email') as string,
                  password: formData.get('password') as string,
                  firstName: formData.get('firstName') as string,
                  lastName: formData.get('lastName') as string,
                  phone: formData.get('phone') as string || undefined,
                  address: formData.get('address') as string || undefined,
                  role: formData.get('role') as string,
                  active: true,
                })
              }}
              className="space-y-4"
            >
              <input
                name="username"
                placeholder="Имя пользователя"
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="password"
                type="password"
                placeholder="Пароль"
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="firstName"
                placeholder="Имя"
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="lastName"
                placeholder="Фамилия"
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="phone"
                placeholder="Телефон"
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="address"
                placeholder="Адрес"
                className="w-full border rounded px-3 py-2"
              />
              <select name="role" required className="w-full border rounded px-3 py-2">
                <option value="CUSTOMER">Клиент</option>
                <option value="PROVIDER">Исполнитель</option>
                <option value="ADMIN">Администратор</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Создать услугу</h2>
              <button onClick={() => setShowCreateService(false)}>
                <XIcon size={24} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                createServiceMutation.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || undefined,
                  price: Number(formData.get('price')),
                  durationMinutes: formData.get('durationMinutes') ? Number(formData.get('durationMinutes')) : undefined,
                  imageUrl: formData.get('imageUrl') as string || undefined,
                  categoryId: Number(formData.get('categoryId')),
                  providerId: formData.get('providerId') ? Number(formData.get('providerId')) : undefined,
                  active: true,
                })
              }}
              className="space-y-4"
            >
              <input
                name="name"
                placeholder="Название услуги"
                required
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                name="description"
                placeholder="Описание"
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="price"
                type="number"
                step="0.01"
                placeholder="Цена"
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="durationMinutes"
                type="number"
                placeholder="Длительность (минуты)"
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="imageUrl"
                placeholder="URL изображения"
                className="w-full border rounded px-3 py-2"
              />
              <select name="categoryId" required className="w-full border rounded px-3 py-2">
                <option value="">Выберите категорию</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select name="providerId" className="w-full border rounded px-3 py-2">
                <option value="">Выберите исполнителя (опционально)</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.firstName} {provider.lastName} ({provider.email})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateService(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Создать заказ</h2>
              <button onClick={() => setShowCreateOrder(false)}>
                <XIcon size={24} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                createOrderMutation.mutate({
                  data: {
                    serviceId: Number(formData.get('serviceId')),
                    scheduledDateTime: formData.get('scheduledDateTime') as string,
                    address: formData.get('address') as string || undefined,
                    notes: formData.get('notes') as string || undefined,
                  },
                  customerId: Number(formData.get('customerId')),
                })
              }}
              className="space-y-4"
            >
              <select name="customerId" required className="w-full border rounded px-3 py-2">
                <option value="">Выберите клиента</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} ({customer.email})
                  </option>
                ))}
              </select>
              <select name="serviceId" required className="w-full border rounded px-3 py-2">
                <option value="">Выберите услугу</option>
                {allServices?.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price.toLocaleString('ru-RU')} ₽
                  </option>
                ))}
              </select>
              <input
                name="scheduledDateTime"
                type="datetime-local"
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="address"
                placeholder="Адрес"
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                name="notes"
                placeholder="Примечания"
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateOrder(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

