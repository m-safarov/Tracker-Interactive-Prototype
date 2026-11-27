import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = window.location.pathname;
    if (error.response?.status === 401 && path !== "/sign-in" && path !== "/sign-up") {
      localStorage.removeItem("access_token");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  },
);

export function errorText(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.error?.message || error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
