import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceApi, categoryApi, orderApi, Service, Order } from '../api/services'
import { Plus, Edit, Trash2, X as XIcon, ShoppingBag, Package, BarChart3, Search, Filter } from 'lucide-react'
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

export default function ProviderPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'book-service' | 'stats'>('services')
  const [showCreateService, setShowCreateService] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showBookService, setShowBookService] = useState(false)
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null)
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL')
  const [orderSearch, setOrderSearch] = useState('')
  const [serviceSearch, setServiceSearch] = useState('')
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('ALL')
  const queryClient = useQueryClient()

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', 'my-services'],
    queryFn: async () => {
      const response = await serviceApi.getMyServices()
      return response.data
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryApi.getAll()
      return response.data
    },
  })

  // Заказы на услуги исполнителя
  const { data: orders, error: ordersError } = useQuery({
    queryKey: ['orders', 'my-provider-orders'],
    queryFn: async () => {
      try {
        const response = await orderApi.getMyProviderOrders()
        console.log('Provider orders response:', response.data)
        return response.data || []
      } catch (err: any) {
        console.error('Error fetching provider orders:', err)
        console.error('Error details:', err.response?.data)
        toast.error(err.response?.data?.message || 'Ошибка при загрузке заказов')
        return []
      }
    },
    enabled: activeTab === 'orders' || activeTab === 'stats',
  })

  // Все услуги для заказа
  const { data: allServices } = useQuery({
    queryKey: ['services', 'all'],
    queryFn: async () => {
      const response = await serviceApi.getAll()
      return response.data
    },
    enabled: activeTab === 'book-service',
  })

  // Фильтрация заказов
  const filteredOrders = orders?.filter((order) => {
    if (orderStatusFilter !== 'ALL' && order.status !== orderStatusFilter) return false
    if (orderSearch) {
      const search = orderSearch.toLowerCase()
      if (!order.serviceName?.toLowerCase().includes(search) &&
          !order.customerName?.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  }) || []

  // Фильтрация услуг
  const filteredServices = services?.filter((service) => {
    if (serviceCategoryFilter !== 'ALL' && service.categoryId !== Number(serviceCategoryFilter)) return false
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

  // Статистика с сервера
  const { data: providerStats } = useQuery({
    queryKey: ['provider', 'stats'],
    queryFn: async () => {
      const response = await orderApi.getProviderStats()
      return response.data
    },
    enabled: activeTab === 'stats',
  })

  // Локальная статистика для быстрого отображения
  const localStats = {
    totalServices: services?.length || 0,
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter((o) => o.status === 'PENDING').length || 0,
    inProgressOrders: orders?.filter((o) => o.status === 'IN_PROGRESS').length || 0,
    completedOrders: orders?.filter((o) => o.status === 'COMPLETED').length || 0,
    totalRevenue: orders?.filter((o) => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalPrice, 0) || 0,
  }

  const stats = providerStats || localStats

  const createServiceMutation = useMutation({
    mutationFn: serviceApi.create,
    onSuccess: () => {
      toast.success('Услуга создана')
      setShowCreateService(false)
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: () => toast.error('Ошибка при создании услуги'),
  })

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => serviceApi.update(id, data),
    onSuccess: () => {
      toast.success('Услуга обновлена')
      setEditingService(null)
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: () => toast.error('Ошибка при обновлении услуги'),
  })

  const deleteServiceMutation = useMutation({
    mutationFn: serviceApi.delete,
    onSuccess: () => {
      toast.success('Услуга удалена')
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: () => toast.error('Ошибка при удалении услуги'),
  })

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) =>
      orderApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Статус заказа обновлен')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: () => toast.error('Ошибка при обновлении статуса'),
  })

  const createOrderMutation = useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      toast.success('Заказ создан')
      setShowBookService(false)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: () => toast.error('Ошибка при создании заказа'),
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Панель исполнителя</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingBag className="inline mr-2" size={18} />
            Мои услуги
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
            Заказы на мои услуги
          </button>
          <button
            onClick={() => setActiveTab('book-service')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'book-service'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Plus className="inline mr-2" size={18} />
            Заказать услугу
          </button>
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
        </nav>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div>
          <div className="flex justify-between items-center mb-6 gap-4">
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
              </div>
            </div>
            <button
              onClick={() => setShowCreateService(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="mr-2" size={18} />
              Добавить услугу
            </button>
          </div>

          {!filteredServices || filteredServices.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 mb-4">
                {serviceSearch ? 'Ничего не найдено' : 'У вас пока нет услуг'}
              </p>
              {!serviceSearch && (
                <button
                  onClick={() => setShowCreateService(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Создать первую услугу
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {service.imageUrl && (
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                {service.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {service.price.toLocaleString('ru-RU')} ₽
                  </span>
                  {service.durationMinutes && (
                    <span className="text-gray-500 text-sm">
                      {service.durationMinutes} мин
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingService(service)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    <Edit className="mr-2" size={16} />
                    Редактировать
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
                        deleteServiceMutation.mutate(service.id!)
                      }
                    }}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Заказы на мои услуги</h2>
            <div className="flex items-center gap-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Поиск заказов..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-500" size={20} />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ALL">Все заказы</option>
                  <option value="PENDING">Ожидают</option>
                  <option value="CONFIRMED">Подтверждены</option>
                  <option value="IN_PROGRESS">В работе</option>
                  <option value="COMPLETED">Завершены</option>
                  <option value="CANCELLED">Отменены</option>
                </select>
              </div>
            </div>
          </div>

          {ordersError ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-red-600 mb-4">Ошибка при загрузке заказов</p>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Попробовать снова
              </button>
            </div>
          ) : !filteredOrders || filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">Нет заказов</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{order.serviceName}</h3>
                      <p className="text-gray-600 mt-1">Клиент: {order.customerName}</p>
                      <p className="text-gray-600">
                        {new Date(order.scheduledDateTime).toLocaleString('ru-RU')}
                      </p>
                      {order.address && (
                        <p className="text-gray-600 mt-1">Адрес: {order.address}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {order.totalPrice.toLocaleString('ru-RU')} ₽
                    </p>
                    {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatusMutation.mutate({
                            id: order.id,
                            status: e.target.value as Order['status'],
                          })
                        }
                        disabled={updateOrderStatusMutation.isPending}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-900 bg-white disabled:opacity-50"
                      >
                        <option value="PENDING">Ожидает</option>
                        <option value="CONFIRMED">Подтвержден</option>
                        <option value="IN_PROGRESS">В работе</option>
                        <option value="COMPLETED">Завершен</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Book Service Tab */}
      {activeTab === 'book-service' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Заказать услугу</h2>
            <div className="flex-1 max-w-md ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Поиск услуг..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {!allServices || allServices.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">Нет доступных услуг</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allServices
                .filter((service) => {
                  if (!serviceSearch) return true
                  const search = serviceSearch.toLowerCase()
                  return (
                    service.name.toLowerCase().includes(search) ||
                    service.description?.toLowerCase().includes(search) ||
                    service.categoryName?.toLowerCase().includes(search)
                  )
                })
                .map((service) => (
                  <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {service.imageUrl && (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                      {service.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary-600">
                          {service.price.toLocaleString('ru-RU')} ₽
                        </span>
                        {service.durationMinutes && (
                          <span className="text-gray-500 text-sm">{service.durationMinutes} мин</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedServiceForBooking(service)
                          setShowBookService(true)
                        }}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        Заказать
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Статистика</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ShoppingBag className="text-blue-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего услуг</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="text-green-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BarChart3 className="text-purple-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ожидают обработки</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="text-yellow-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">В работе</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgressOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BarChart3 className="text-green-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Завершено</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BarChart3 className="text-primary-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Общая выручка</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stats.totalRevenue === 'number' 
                      ? stats.totalRevenue.toLocaleString('ru-RU')
                      : Number(stats.totalRevenue).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            </div>
            {providerStats && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <BarChart3 className="text-blue-500" size={24} />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Средний чек</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Number(providerStats.averageOrderValue).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Package className="text-green-500" size={24} />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Подтверждено</p>
                      <p className="text-2xl font-bold text-gray-900">{providerStats.confirmedOrders}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                rows={3}
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

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Редактировать услугу</h2>
              <button onClick={() => setEditingService(null)}>
                <XIcon size={24} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                updateServiceMutation.mutate({
                  id: editingService.id!,
                  data: {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string || undefined,
                    price: Number(formData.get('price')),
                    durationMinutes: formData.get('durationMinutes') ? Number(formData.get('durationMinutes')) : undefined,
                    imageUrl: formData.get('imageUrl') as string || undefined,
                    categoryId: Number(formData.get('categoryId')),
                  },
                })
              }}
              className="space-y-4"
            >
              <input
                name="name"
                defaultValue={editingService.name}
                placeholder="Название услуги"
                required
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                name="description"
                defaultValue={editingService.description}
                placeholder="Описание"
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={editingService.price}
                placeholder="Цена"
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="durationMinutes"
                type="number"
                defaultValue={editingService.durationMinutes}
                placeholder="Длительность (минуты)"
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="imageUrl"
                defaultValue={editingService.imageUrl}
                placeholder="URL изображения"
                className="w-full border rounded px-3 py-2"
              />
              <select name="categoryId" defaultValue={editingService.categoryId} required className="w-full border rounded px-3 py-2">
                <option value="">Выберите категорию</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Service Modal */}
      {showBookService && selectedServiceForBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Заказать услугу</h2>
              <button onClick={() => {
                setShowBookService(false)
                setSelectedServiceForBooking(null)
              }}>
                <XIcon size={24} />
              </button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold text-gray-900">{selectedServiceForBooking.name}</h3>
              <p className="text-primary-600 font-bold mt-1">
                {selectedServiceForBooking.price.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                createOrderMutation.mutate({
                  serviceId: selectedServiceForBooking.id!,
                  scheduledDateTime: formData.get('scheduledDateTime') as string,
                  address: formData.get('address') as string || undefined,
                  notes: formData.get('notes') as string || undefined,
                })
              }}
              className="space-y-4"
            >
              <input
                name="scheduledDateTime"
                type="datetime-local"
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="address"
                placeholder="Адрес (опционально)"
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                name="notes"
                placeholder="Примечания (опционально)"
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Заказать
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookService(false)
                    setSelectedServiceForBooking(null)
                  }}
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

