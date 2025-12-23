import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '../api/services'
import { Calendar, MapPin, X, Filter, Search } from 'lucide-react'
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

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [orderSearch, setOrderSearch] = useState('')

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', 'my-orders'],
    queryFn: async () => {
      try {
        const response = await orderApi.getMyOrders()
        console.log('Orders response:', response.data)
        return response.data || []
      } catch (err: any) {
        console.error('Error fetching orders:', err)
        console.error('Error details:', err.response?.data)
        toast.error(err.response?.data?.message || 'Ошибка при загрузке заказов')
        return []
      }
    },
  })

  const cancelOrderMutation = useMutation({
    mutationFn: orderApi.cancel,
    onSuccess: () => {
      toast.success('Заказ отменен')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: () => {
      toast.error('Ошибка при отмене заказа')
    },
  })

  // Фильтрация заказов
  const filteredOrders = orders?.filter((order) => {
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Ошибка при загрузке заказов</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Мои заказы</h1>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
      </div>

      {!filteredOrders || filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">У вас пока нет заказов</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders
            .sort((a, b) => {
              // Сортируем: сначала активные, потом завершенные
              if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1
              if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })
            .map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{order.serviceName}</h3>
                  <p className="text-gray-600 mt-1">
                    {order.providerName && `Исполнитель: ${order.providerName}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-2" size={18} />
                  {new Date(order.scheduledDateTime).toLocaleString('ru-RU')}
                </div>
                {order.address && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="mr-2" size={18} />
                    {order.address}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-primary-600">
                  {order.totalPrice.toLocaleString('ru-RU')} ₽
                </p>
                <div className="flex items-center gap-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => cancelOrderMutation.mutate(order.id)}
                      disabled={cancelOrderMutation.isPending}
                      className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <X className="mr-2" size={18} />
                      Отменить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}








