import axios from "axios";

export const api = axios.create({ baseURL: "/api", timeout: 20_000 });

export function errorText(error: unknown) {
  const fallback = "Something went wrong. Please try again.";
  if (axios.isAxiosError<{ error?: { message?: unknown } }>(error)) {
    const message = error.response?.data?.error?.message;
    return typeof message === "string" && message.trim() ? message : fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
