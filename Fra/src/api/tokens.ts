// El refresh token vive en una cookie HttpOnly — el servidor la gestiona.
// Este módulo solo maneja los datos no sensibles que sí se guardan en localStorage.
export const ACCESS_KEY = "access" as const;
export const ADMIN_FLAG_KEY = "is_admin" as const;
export const ROLE_KEY = "role" as const;

export const getAccess = (): string | null => localStorage.getItem(ACCESS_KEY);

export const setAccess = (token: string): void =>
  localStorage.setItem(ACCESS_KEY, token);

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(ADMIN_FLAG_KEY);
  localStorage.removeItem(ROLE_KEY);
};
