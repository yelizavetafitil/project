import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { categoryApi } from '../api/services'
import { Sparkles, Wrench, Heart, Scissors, Home, Car } from 'lucide-react'

const categoryIcons: Record<string, any> = {
  'Быт': Wrench,
  'Красота': Scissors,
  'Здоровье': Heart,
  'Ремонт': Home,
  'Авто': Car,
}

export default function HomePage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryApi.getAll()
      return response.data
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Услуги на дом - быстро, удобно, надежно
        </h1>
        <p className="text-xl text-gray-600">
          Найдите нужную услугу и закажите специалиста прямо сейчас
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => {
            const Icon = categoryIcons[category.name] || Sparkles
            return (
              <Link
                key={category.id}
                to={`/services?category=${category.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-900">{category.name}</h3>
                </div>
                {category.description && (
                  <p className="text-gray-600 mb-2">{category.description}</p>
                )}
                {category.serviceCount !== undefined && (
                  <p className="text-sm text-gray-500">
                    {category.serviceCount} {category.serviceCount === 1 ? 'услуга' : 'услуг'}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
















