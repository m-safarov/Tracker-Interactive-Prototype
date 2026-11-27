import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// shortcut: вақтан бе регистрация — бо корбари тестӣ аз .env.local худкор ворид мешавад.
// Вақте Dev 1 /sign-in-ро сохт, ин функсия ва NEXT_PUBLIC_DEV_* дар .env.local нест карда мешаванд.
const devEmail = process.env.NEXT_PUBLIC_DEV_EMAIL;
const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD;

async function devLogin() {
  const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    email: devEmail,
    password: devPassword,
  });
  localStorage.setItem("access_token", data.access_token);
  return data.access_token as string;
}

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("access_token");
  if (!token && devEmail) token = await devLogin();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Token баъди 15 дақиқа кӯҳна мешавад: бо корбари тестӣ аз нав ворид шуда, дархостро як бор такрор мекунем.
    if (error.response?.status === 401 && devEmail && !error.config._retried) {
      localStorage.removeItem("access_token");
      error.config._retried = true;
      return api(error.config);
    }
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
