import axios, { type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/auth-store';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  timeout: 12000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  async (response) => {
    const result = response.data as ApiResponse<unknown>;

    if (result.code !== 0) {
      return Promise.reject(new Error(result.message));
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status as number | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error('未登录或登录态已过期');
        }

        const refreshResponse = await axios.post<
          ApiResponse<{ accessToken: string; refreshToken: string }>
        >(
          `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'}/auth/refresh-token`,
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
        const user = useAuthStore.getState().user;

        if (!user) {
          throw new Error('用户信息丢失，请重新登录');
        }

        useAuthStore.getState().setAuth({ accessToken, refreshToken: newRefreshToken, user });

        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  },
);

export function unwrapResponse<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export { apiClient };
