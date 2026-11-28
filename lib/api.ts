import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  if (config.url?.startsWith("/invites/")) config.url = "/workspaces/_invites/" + config.url.slice("/invites/".length);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const { pathname, search, hash } = window.location;
      if (!["/sign-in", "/sign-up", "/login"].includes(pathname)) {
        window.location.replace("/sign-in?next=" + encodeURIComponent(pathname + search + hash));
      }
    }
    return Promise.reject(error);
  },
);

export function errorText(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.error?.message || error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
