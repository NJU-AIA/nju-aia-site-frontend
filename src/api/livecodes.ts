import axios from 'axios'
import { getToken } from '@/api/auth'

export type LivecodeBlockType = 'markdown' | 'code'

export interface LivecodeBlock {
  id?: string
  type: LivecodeBlockType
  language?: string
  content: string
  order: number
}

export interface LivecodeDocument {
  id: string
  slug: string
  publishedAt: string
  blocks: LivecodeBlock[]
}

export interface LivecodeListItem {
  id: string
  slug: string
  publishedAt: string
}

export interface LivecodeListResponse {
  items: LivecodeListItem[]
}

export interface LivecodeBlockRequest {
  type: LivecodeBlockType
  language?: string
  content: string
  order: number
}

export interface LivecodeUpsertRequest {
  slug: string
  publishedAt: string
  blocks: LivecodeBlockRequest[]
}

const livecodeApiBaseUrl = import.meta.env.VITE_LIVECODE_API_BASE_URL || '/livecodes-api'

const http = axios.create({
  baseURL: livecodeApiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
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
  }
)

export const livecodesApi = {
  list() {
    return http.get<LivecodeListResponse>('/livecodes')
  },

  getById(id: string) {
    return http.get<LivecodeDocument>(`/livecodes/${id}`)
  },

  create(data: LivecodeUpsertRequest) {
    return http.post<Record<string, string>>('/livecodes', data)
  },

  update(id: string, data: LivecodeUpsertRequest) {
    return http.put<void>(`/livecodes/${id}`, data)
  },

  remove(id: string) {
    return http.delete<void>(`/livecodes/${id}`)
  },
}
