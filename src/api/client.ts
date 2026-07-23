import axios from "axios";
import { v7 as uuidv7 } from "uuid";

const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
};

const baseClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

baseClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("cesar_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase() || "")) {
    config.headers["Idempotency-Key"] = uuidv7();
  }
  return config;
});

baseClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      sessionStorage.removeItem("cesar_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

type RequestConfig = {
  url: string;
  method: string;
  data?: unknown;
  params?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export const apiClient = async <T>(config: RequestConfig): Promise<T> => {
  const response = await baseClient.request<T>({
    url: config.url,
    method: config.method,
    data: config.data,
    params: config.params,
    headers: { ...config.headers },
    signal: config.signal,
  });
  return response.data;
};

export const loginClient = async <T>(config: RequestConfig): Promise<T> => {
  const response = await axios.create({ baseURL: getBaseUrl() }).request<T>({
    url: config.url,
    method: config.method,
    data: config.data,
    params: config.params,
    headers: config.headers,
    signal: config.signal,
  });
  return response.data;
};
