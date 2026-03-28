// src/api/client.ts
const API_BASE = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8000/api";
export type ViewMode = 'homework' | 'slides' | 'article';

export interface DocumentMeta {
  id: string;
  title: string;
  category: string;
  date: string;
  defaultMode: ViewMode;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json() as T
}

export const api = {
  getMembers: () => request<any[]>('/members'),
  getHonors: () => request<any[]>('/honors'),
  getDocList: (category?: string) => request<any[]>(category ? `/documents?category=${category}` : '/documents'),
  getDocContent: (id: string) => request<{content: string}>(`/documents/${id}`),
  getAbout: () => request<any>('/about'),

  saveDoc: (data: { id: string; title: string; category: string; defaultMode: string; content: string }) => 
    request<any>('/documents', { method: 'POST', body: JSON.stringify(data) }),
    
  deleteDoc: (id: string) => 
    request<any>(`/documents/${id}`, { method: 'DELETE' })
};