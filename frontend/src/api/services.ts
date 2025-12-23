import apiClient from './client'

export interface Category {
  id: number
  name: string
  description?: string
  icon?: string
  serviceCount?: number
}

export interface Service {
  id: number
  name: string
  description?: string
  price: number
  durationMinutes?: number
  imageUrl?: string
  categoryId: number
  categoryName?: string
  providerId?: number
  providerName?: string
  active?: boolean
  averageRating?: number
  reviewCount?: number
}

export interface Order {
  id: number
  customerId: number
  customerName?: string
  serviceId: number
  serviceName?: string
  providerId?: number
  providerName?: string
  scheduledDateTime: string
  address?: string
  notes?: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  totalPrice: number
  createdAt: string
  completedAt?: string
}

export interface Review {
  id: number
  orderId: number
  providerId: number
  providerName?: string
  serviceId: number
  serviceName?: string
  rating: number
  comment: string
  createdAt: string
}

export const categoryApi = {
  getAll: () => apiClient.get<Category[]>('/categories'),
  getById: (id: number) => apiClient.get<Category>(`/categories/${id}`),
}

export const serviceApi = {
  getAll: () => apiClient.get<Service[]>('/services'),
  getById: (id: number) => apiClient.get<Service>(`/services/${id}`),
  getByCategory: (categoryId: number) =>
    apiClient.get<Service[]>(`/services/category/${categoryId}`),
  getByProvider: (providerId: number) =>
    apiClient.get<Service[]>(`/services/provider/${providerId}`),
  getMyServices: () => apiClient.get<Service[]>('/services/my-services'),
  create: (data: {
    name: string
    description?: string
    price: number
    durationMinutes?: number
    imageUrl?: string
    categoryId: number
    providerId?: number
    active?: boolean
  }) => apiClient.post<Service>('/services', data),
  update: (id: number, data: {
    name?: string
    description?: string
    price?: number
    durationMinutes?: number
    imageUrl?: string
    categoryId?: number
    active?: boolean
  }) => apiClient.put<Service>(`/services/${id}`, data),
  delete: (id: number) => apiClient.delete(`/services/${id}`),
}

export const orderApi = {
  getAll: () => apiClient.get<Order[]>('/orders'),
  getById: (id: number) => apiClient.get<Order>(`/orders/${id}`),
  getMyOrders: () => apiClient.get<Order[]>('/orders/my-orders'),
  getMyProviderOrders: () => apiClient.get<Order[]>('/orders/my-provider-orders'),
  getByCustomer: (customerId: number) =>
    apiClient.get<Order[]>(`/orders/customer/${customerId}`),
  create: (data: {
    serviceId: number
    scheduledDateTime: string
    address?: string
    notes?: string
  }) => apiClient.post<Order>('/orders', data),
  updateStatus: (id: number, status: Order['status']) =>
    apiClient.put<Order>(`/orders/${id}/status?status=${status}`),
  cancel: (id: number) => apiClient.delete(`/orders/${id}`),
  getProviderStats: () => apiClient.get<ProviderStats>('/orders/provider/stats'),
}

export const reviewApi = {
  getAll: () => apiClient.get<Review[]>('/reviews'),
  getById: (id: number) => apiClient.get<Review>(`/reviews/${id}`),
  getByService: (serviceId: number) =>
    apiClient.get<Review[]>(`/reviews/service/${serviceId}`),
  create: (data: {
    orderId: number
    rating: number
    comment: string
  }) => apiClient.post<Review>('/reviews', data),
}

export interface User {
  id?: number
  username: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  role: string
  active?: boolean
  createdAt?: string
}

export const userApi = {
  getMe: () => apiClient.get<User>('/users/me'),
  getById: (id: number) => apiClient.get<User>(`/users/${id}`),
  getByUsername: (username: string) => apiClient.get<User>(`/users/username/${username}`),
}

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<{ token: string; username: string; role: string }>('/auth/login', {
      username,
      password,
    }),
  register: (data: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) =>
    apiClient.post<{ token: string; username: string; role: string }>('/auth/register', data),
}

export interface AdminStats {
  totalUsers: number
  totalCustomers: number
  totalProviders: number
  totalServices: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  totalRevenue: number
  ordersByStatus: Record<string, number>
  usersByRole: Record<string, number>
}

export interface ProviderStats {
  totalServices: number
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  inProgressOrders: number
  completedOrders: number
  cancelledOrders: number
  totalRevenue: number
  averageOrderValue: number
  ordersByStatus: Record<string, number>
  ordersByService: Record<string, number>
}

export const adminApi = {
  getStats: () => apiClient.get<AdminStats>('/admin/stats'),
  getAllUsers: () => apiClient.get<User[]>('/admin/users'),
  createUser: (data: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    address?: string
    role: string
    active?: boolean
  }) => apiClient.post<User>('/admin/users', data),
  updateUserStatus: (id: number, active: boolean) =>
    apiClient.put<User>(`/admin/users/${id}/status?active=${active}`),
  updateUserRole: (id: number, role: string) =>
    apiClient.put<User>(`/admin/users/${id}/role?role=${role}`),
  deleteUser: (id: number) => apiClient.delete(`/admin/users/${id}`),
  getAllServices: () => apiClient.get<Service[]>('/admin/services'),
  createService: (data: {
    name: string
    description?: string
    price: number
    durationMinutes?: number
    imageUrl?: string
    categoryId: number
    providerId?: number
    active?: boolean
  }) => apiClient.post<Service>('/admin/services', data),
  updateServiceStatus: (id: number, active: boolean) =>
    apiClient.put<Service>(`/admin/services/${id}/status?active=${active}`),
  deleteService: (id: number) => apiClient.delete(`/admin/services/${id}`),
  getAllOrders: () => apiClient.get<Order[]>('/admin/orders'),
  createOrder: (data: {
    serviceId: number
    scheduledDateTime: string
    address?: string
    notes?: string
  }, customerId: number) =>
    apiClient.post<Order>(`/admin/orders?customerId=${customerId}`, data),
  updateOrderStatus: (id: number, status: Order['status']) =>
    apiClient.put<Order>(`/admin/orders/${id}/status?status=${status}`),
  deleteOrder: (id: number) => apiClient.delete(`/admin/orders/${id}`),
}








