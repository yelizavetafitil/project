import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  token: string | null
  username: string | null
  role: string | null
  setAuth: (token: string, username: string, role: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      role: null,
      setAuth: (token, username, role) => set({ token, username, role }),
      clearAuth: () => set({ token: null, username: null, role: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

