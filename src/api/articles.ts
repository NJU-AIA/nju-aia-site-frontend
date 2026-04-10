import axios from 'axios';
import { getToken } from '@/api/auth';

export type ArticleCategory = 'activity' | 'tutorial';
export type ArticleMode =
  | 'slide'
  | 'activity'
  | 'color'
  | 'elegant'
  | 'line'
  | 'minimal'
  | 'technical'
  | 'article'
  | 'homework';

export interface Article {
  id: string;
  title: string;
  author: string;
  category: string;
  date?: string;
  published?: boolean;
  content: string;
  cover?: string;
  defaultMode: ArticleMode;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleListResponse {
  items: Article[];
}

export interface CreateArticleRequest {
  title: string;
  author: string;
  category: string;
  date: string;
  published?: boolean;
  content: string;
  cover?: string;
  defaultMode: ArticleMode;
}

export interface CreateArticleResponse {
  id: string;
}

interface ArticleQueryOptions {
  withAuth?: boolean;
}

const baseConfig = {
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const publicHttp = axios.create(baseConfig);
const authedHttp = axios.create(baseConfig);

authedHttp.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleResponseError = (error: any) => {
  const message =
    error?.response?.data?.error ||
    error?.message ||
    '请求失败';
  return Promise.reject(new Error(message));
};

publicHttp.interceptors.response.use((response) => response, handleResponseError);
authedHttp.interceptors.response.use((response) => response, handleResponseError);

export const articlesApi = {
  getArticles(options?: ArticleQueryOptions) {
    const client = options?.withAuth ? authedHttp : publicHttp;
    return client.get<ArticleListResponse>('/articles');
  },

  getArticleById(id: string, options?: ArticleQueryOptions) {
    const client = options?.withAuth ? authedHttp : publicHttp;
    return client.get<Article>(`/articles/${id}`);
  },

  createArticle(data: CreateArticleRequest) {
    return authedHttp.post<CreateArticleResponse>('/articles', data);
  },

  updateArticle(id: string, data: CreateArticleRequest) {
    return authedHttp.put<void>(`/articles/${id}`, data);
  },

  deleteArticle(id: string) {
    return authedHttp.delete<void>(`/articles/${id}`);
  },
};
