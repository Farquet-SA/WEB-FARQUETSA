import api from "./axios";
import {
  ACCESS_KEY,
  ADMIN_FLAG_KEY,
  ROLE_KEY,
  clearTokens,
  getAccess,
  setAccess,
} from "./tokens";
import type { AdminUser, LoginResult } from "../types/api";

export type { AdminUser, LoginResult };

export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  const { data } = await api.post<{ access: string }>("/auth/login/", {
    username,
    password,
  });
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

  const role = me.role ?? (me.is_superuser ? "superadmin" : "admin");
  localStorage.setItem(ADMIN_FLAG_KEY, "1");
  localStorage.setItem(ROLE_KEY, role);
  return { access: data.access, me };
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export async function getCurrentUser(): Promise<AdminUser> {
  const { data } = await api.get<AdminUser>("/auth/me/");
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout/");
  } catch {
    // best effort
  }
  clearTokens();
}

function decodePayload(token: string): { exp?: number } | null {
  if (!token || token.split(".").length < 2) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(payload);
    return JSON.parse(decoded) as { exp?: number };
  } catch {
    return null;
  }
}

export function isTokenValid(): boolean {
  const token = getAccess();
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

export function isAuthed(): boolean {
  return isTokenValid() && localStorage.getItem(ADMIN_FLAG_KEY) === "1";
}

// Reexport ACCESS_KEY so existing JS consumers importing from auth still work
export { ACCESS_KEY };
