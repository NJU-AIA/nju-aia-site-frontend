import axios from 'axios';

export type ArticleCategory = 'activity' | 'tutorial';

export type ArticleMode = 'article' | 'slide' | 'homework';

export interface Article {
  id: string;
  title: string;
  author: string;
  category: string;
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
  content: string;
  cover?: string;
  defaultMode: ArticleMode;
}

export interface CreateArticleResponse {
  id: string;
}

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const articlesApi = {
  getArticles() {
    return http.get<ArticleListResponse>('/articles');
  },

  getArticleById(id: string) {
    return http.get<Article>(`/articles/${id}`);
  },

  createArticle(data: CreateArticleRequest) {
    return http.post<CreateArticleResponse>('/articles', data);
  },

  updateArticle(id: string, data: CreateArticleRequest) {
    return http.put<void>(`/articles/${id}`, data);
  },

  deleteArticle(id: string) {
    return http.delete<void>(`/articles/${id}`);
  },
};