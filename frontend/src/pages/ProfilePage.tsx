import { useQuery } from '@tanstack/react-query'
import { userApi } from '../api/services'
import { User as UserIcon, Mail, Phone, MapPin } from 'lucide-react'

export default function ProfilePage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await userApi.getMe()
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Профиль</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="p-4 bg-primary-100 rounded-full">
            <UserIcon className="text-primary-600" size={32} />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">@{user?.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Mail className="mr-3 text-gray-400" size={20} />
            <span className="text-gray-700">{user?.email}</span>
          </div>
          {user?.phone && (
            <div className="flex items-center">
              <Phone className="mr-3 text-gray-400" size={20} />
              <span className="text-gray-700">{user.phone}</span>
            </div>
          )}
          {user?.address && (
            <div className="flex items-center">
              <MapPin className="mr-3 text-gray-400" size={20} />
              <span className="text-gray-700">{user.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}








