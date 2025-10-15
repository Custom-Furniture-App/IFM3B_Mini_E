import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { AxiosRequestConfig } from "axios";

//const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const baseUrl = "http://localhost:5012/api";
const api: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      console.error(
        `[API ERROR] ${error.response.status}: ${
          error.response.data?.message || error.message
        }`
      );
    } else {
      console.error(`[NETWORK ERROR]: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

const apiService = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config),
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, config),
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, config),
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, config),
};

export { api, apiService };
