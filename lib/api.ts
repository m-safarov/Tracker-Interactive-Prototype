import axios from "axios";

// Ҳамаи дархостҳо ба proxy-и Next (/api/workspaces/...) мераванд; proxy cookie-и HttpOnly-ро ҳамчун token ба backend мефиристад.
export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = window.location.pathname;
    if (error.response?.status === 401 && path !== "/sign-in" && path !== "/sign-up") {
      window.location.replace(`/sign-in?next=${encodeURIComponent(path)}`);
    }
    return Promise.reject(error);
  },
);

export function errorText(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.error?.message || error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
