import axios from 'axios'

export type AdminRole = 'owner' | 'admin'

export interface CurrentUser {
  id: number
  username: string
  email: string
  displayName: string
  role: AdminRole
}

export interface AdminUser {
  id: number
  username: string
  email: string
  displayName: string
  role: AdminRole
  enabled: boolean
  bound: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminUserListResponse {
  items: AdminUser[]
}

export interface ErrorResponse {
  detail?: string
  error?: string
}

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      '请求失败'
    return Promise.reject(new Error(message))
  },
)

let cachedUser: CurrentUser | null | undefined
let pendingUserRequest: Promise<CurrentUser | null> | null = null

export const authApi = {
  loginURL: '/api/auth/oidc/login',

  me() {
    return http.get<CurrentUser>('/auth/me')
  },

  logout() {
    return http.post<void>('/auth/logout')
  },

  listUsers() {
    return http.get<AdminUserListResponse>('/admin/users')
  },

  createUser(username: string, role: AdminRole) {
    return http.post<AdminUser>('/admin/users', { username, role })
  },

  updateUser(id: number, role: AdminRole, enabled: boolean) {
    return http.put<AdminUser>(`/admin/users/${id}`, { role, enabled })
  },

  deleteUser(id: number) {
    return http.delete<void>(`/admin/users/${id}`)
  },
}

export function getCachedUser(): CurrentUser | null | undefined {
  return cachedUser
}

export async function getCurrentUser(force = false): Promise<CurrentUser | null> {
  if (!force && cachedUser !== undefined) {
    return cachedUser
  }
  if (!force && pendingUserRequest) {
    return pendingUserRequest
  }

  pendingUserRequest = authApi
    .me()
    .then((response) => {
      cachedUser = response.data
      return response.data
    })
    .catch(() => {
      cachedUser = null
      return null
    })
    .finally(() => {
      pendingUserRequest = null
    })

  return pendingUserRequest
}

export function clearCurrentUser() {
  cachedUser = null
}
