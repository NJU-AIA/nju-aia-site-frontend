import axios from 'axios';

export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ErrorResponse {
  detail?: string;
  error?: string;
}

const TOKEN_KEY = 'admin_token';

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
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  /**
   * 管理员登录
   * POST /auth/login
   */
  login(data: LoginRequest) {
    return http.post<LoginResponse>('/auth/login', data);
  },
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}