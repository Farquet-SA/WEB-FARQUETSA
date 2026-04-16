import axios from "axios";
import { getAccess, setAccess, clearTokens } from "./tokens";

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error(
    "❌ Falta VITE_API_URL en tu .env (ej: VITE_API_URL=http://127.0.0.1:8000/api)",
  );
}

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // envía la cookie HttpOnly del refresh token automáticamente
  headers: {
    Accept: "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const access = getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let isRefreshing = false;
let queue = [];

const runQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  queue = [];
};

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    if (!original) return Promise.reject(error);

    const url = original.url || "";
    const isAuthCall =
      url.includes("/auth/login/") || url.includes("/auth/refresh/");

    if (error?.response?.status !== 401 || isAuthCall || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return instance(original);
      });
    }

    isRefreshing = true;

    try {
      // La cookie HttpOnly se envía automáticamente con withCredentials: true.
      // No necesitamos pasar el refresh en el body.
      const resp = await axios.post(
        `${BASE_URL}/auth/refresh/`,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } },
      );

      const newAccess = resp.data?.access;
      if (!newAccess) throw new Error("No access token returned on refresh");

      setAccess(newAccess);
      runQueue(null, newAccess);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return instance(original);
    } catch (e) {
      runQueue(e, null);
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  },
);

export default instance;
