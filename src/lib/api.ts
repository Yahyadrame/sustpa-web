import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/types/api.types";

const api = axios.create({
  // ✅ CORRIGÉ — baseURL = /api/v1 (le proxy ajoute /api devant,
  // donc la requête finale sera http://localhost:3002/api/v1/...)
  baseURL:         "/api/v1",
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject:  (err: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(original)),
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        await axios.post(
          "/api/v1/auth/refresh",
          {},
          { withCredentials: true },
        );

        processQueue(null);
        return api(original);
      } catch (err) {
        processQueue(err);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;