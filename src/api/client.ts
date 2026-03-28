// src/api/client.ts
const API_BASE = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8000/api";
// 在 src/api/client.ts 中补充导出：
export type ViewMode = 'homework' | 'slides' | 'article';

export interface DocumentMeta {
  id: string;
  title: string;
  category: string;
  date: string;
  defaultMode: ViewMode;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json() as T;
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
}

// 导出具体的业务接口
export const api = {
  getMembers: () => request<any[]>('/members'),
  getHonors: () => request<any[]>('/honors'),
  getDocList: (category?: string) => request<any[]>(category ? `/documents?category=${category}` : '/documents'),
  getDocContent: (id: string) => request<{content: string}>(`/documents/${id}`),
  getAbout: () => request<any>('/about'),

  // 【新增】保存/更新文章
  saveDoc: (data: { id: string; title: string; category: string; defaultMode: string; content: string }) => 
    request<any>('/documents', { method: 'POST', body: JSON.stringify(data) }),
    
  // 【新增】删除文章
  deleteDoc: (id: string) => 
    request<any>(`/documents/${id}`, { method: 'DELETE' })
};