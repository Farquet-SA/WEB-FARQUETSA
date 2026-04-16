import api from "./axios";
import {
  ACCESS_KEY,
  ADMIN_FLAG_KEY,
  ROLE_KEY,
  clearTokens,
  getAccess,
  setAccess,
} from "./tokens";

export async function login(username, password) {
  const { data } = await api.post("/auth/login/", { username, password });
  // El servidor setea el refresh token como cookie HttpOnly.
  // Solo guardamos el access token (vida corta: 15 min).
  setAccess(data.access);

  const me = await getCurrentUser();
  if (!me?.is_staff) {
    clearTokens();
    try {
      await api.post("/auth/logout/");
    } catch {
      // best effort — invalida la cookie del servidor
    }
    throw new Error("Tu usuario no tiene permisos de administrador.");
  }

  const role = me.role || (me.is_superuser ? "superadmin" : "admin");
  localStorage.setItem(ADMIN_FLAG_KEY, "1");
  localStorage.setItem(ROLE_KEY, role);
  return { access: data.access, me };
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me/");
  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout/");
  } catch {
    // best effort
  }
  clearTokens();
}

function decodePayload(token) {
  if (!token || token.split(".").length < 2) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isTokenValid() {
  const token = getAccess();
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

export function isAuthed() {
  return isTokenValid() && localStorage.getItem(ADMIN_FLAG_KEY) === "1";
}
