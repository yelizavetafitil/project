import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { serviceApi, categoryApi } from '../api/services'
import { Star, Clock, Search } from 'lucide-react'
import { useState } from 'react'

export default function ServicesPage() {
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get('category')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', categoryId],
    queryFn: async () => {
      if (categoryId) {
        const response = await serviceApi.getByCategory(Number(categoryId))
        return response.data
      }
      const response = await serviceApi.getAll()
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

  // Фильтрация услуг по поисковому запросу
  const filteredServices = services?.filter((service) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      service.name.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query) ||
      service.categoryName?.toLowerCase().includes(query) ||
      service.providerName?.toLowerCase().includes(query)
    )
  }) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Все услуги</h1>
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск услуг..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/services"
            className={`px-4 py-2 rounded-lg ${
              !categoryId
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Все
          </Link>
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/services?category=${category.id}`}
              className={`px-4 py-2 rounded-lg ${
                categoryId === String(category.id)
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Услуги не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">
                      {service.price.toLocaleString('ru-RU')} ₽
                    </p>
                    {service.durationMinutes && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock size={14} className="mr-1" />
                        {service.durationMinutes} мин
                      </div>
                    )}
                  </div>
                  {service.averageRating && (
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <span className="ml-1 text-sm font-medium">
                        {service.averageRating.toFixed(1)}
                      </span>
                      {service.reviewCount && (
                        <span className="ml-1 text-sm text-gray-500">
                          ({service.reviewCount})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}














