import axios from 'axios'

export type LivecodeBlockType = 'markdown' | 'code'

export interface LivecodeBlock {
  id?: string
  type: LivecodeBlockType
  language?: string
  content: string
}

export interface LivecodeDocument {
  id: string
  slug: string
  publishedAt: string
  blockIds?: string[]
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
}

export interface LivecodeUpsertRequest {
  slug: string
  publishedAt: string
}

export interface LivecodeCreateResponse {
  id: string
}

export interface LivecodeBlockIdsRequest {
  blockIds: string[]
}

const livecodeApiBaseUrl = import.meta.env.VITE_LIVECODE_API_BASE_URL || '/api'

const http = axios.create({
  baseURL: livecodeApiBaseUrl,
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
  }
)

export const livecodesApi = {
  list() {
    return http.get<LivecodeListResponse>('/livecodes')
  },

  getById(id: string) {
    return http.get<LivecodeDocument>(`/livecodes/${id}`)
  },

  createDocument(data: LivecodeUpsertRequest) {
    return http.post<LivecodeCreateResponse>('/livecodes', data)
  },

  createBlock(id: string, data: LivecodeBlockRequest) {
    return http.post<LivecodeBlock>(`/livecodes/${id}/blocks`, data)
  },

  updateBlock(id: string, blockId: string, data: LivecodeBlockRequest) {
    return http.put<LivecodeBlock>(`/livecodes/${id}/blocks/${blockId}`, data)
  },

  removeBlock(id: string, blockId: string) {
    return http.delete<void>(`/livecodes/${id}/blocks/${blockId}`)
  },

  updateBlockIds(id: string, data: LivecodeBlockIdsRequest) {
    return http.put<void>(`/livecodes/${id}/block-ids`, data)
  },

  remove(id: string) {
    return http.delete<void>(`/livecodes/${id}`)
  },
}
