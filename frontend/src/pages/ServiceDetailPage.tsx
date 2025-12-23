import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { serviceApi, orderApi, reviewApi } from '../api/services'
import { useAuthStore } from '../store/authStore'
import { Star, Clock, Calendar, MapPin } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const queryClient = useQueryClient()

  const [scheduledDateTime, setScheduledDateTime] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const response = await serviceApi.getById(Number(id))
      return response.data
    },
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const response = await reviewApi.getByService(Number(id))
      return response.data
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      toast.success('Заказ создан успешно!')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate('/orders')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Ошибка при создании заказа'
      toast.error(errorMessage)
      console.error('Order creation error:', error)
    },
  })

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    
    if (!isAuthenticated()) {
      toast.error('Необходимо войти в систему')
      navigate('/login')
      return
    }

    if (!scheduledDateTime) {
      setFormErrors({ scheduledDateTime: 'Выберите дату и время' })
      toast.error('Выберите дату и время')
      return
    }

    // Проверка, что дата не в прошлом
    const selectedDate = new Date(scheduledDateTime)
    if (selectedDate < new Date()) {
      setFormErrors({ scheduledDateTime: 'Дата не может быть в прошлом' })
      toast.error('Дата не может быть в прошлом')
      return
    }

    createOrderMutation.mutate({
      serviceId: Number(id),
      scheduledDateTime: scheduledDateTime,
      address: address || undefined,
      notes: notes || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!service) {
    return <div>Услуга не найдена</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {service.imageUrl && (
            <img
              src={service.imageUrl}
              alt={service.name}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.name}</h1>
          {service.description && (
            <p className="text-gray-600 mb-6">{service.description}</p>
          )}
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-primary-600">
                {service.price.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            {service.durationMinutes && (
              <div className="flex items-center text-gray-600">
                <Clock className="mr-2" size={20} />
                Длительность: {service.durationMinutes} минут
              </div>
            )}
            {service.averageRating && (
              <div className="flex items-center">
                <Star className="text-yellow-400 fill-yellow-400 mr-2" size={20} />
                <span className="font-medium">{service.averageRating.toFixed(1)}</span>
                {service.reviewCount && (
                  <span className="ml-2 text-gray-600">({service.reviewCount} отзывов)</span>
                )}
              </div>
            )}
            {service.providerName && (
              <div className="text-gray-600">
                Исполнитель: <span className="font-medium">{service.providerName}</span>
              </div>
            )}
          </div>

          {reviews && reviews.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Отзывы</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }
                            size={16}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium">{review.providerName}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Заказать услугу</h2>
            <form onSubmit={handleOrder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-1" size={16} />
                  Дата и время <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => {
                    setScheduledDateTime(e.target.value)
                    setFormErrors({ ...formErrors, scheduledDateTime: '' })
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                    formErrors.scheduledDateTime 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-primary-500'
                  }`}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
                {formErrors.scheduledDateTime && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.scheduledDateTime}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline mr-1" size={16} />
                  Адрес
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="Введите адрес (необязательно)"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Примечания
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="Дополнительная информация (необязательно)"
                />
              </div>
              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {createOrderMutation.isPending ? 'Создание заказа...' : 'Заказать'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}




