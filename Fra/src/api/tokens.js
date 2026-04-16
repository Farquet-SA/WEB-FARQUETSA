export const ACCESS_KEY = "access";
export const REFRESH_KEY = "refresh";
export const ADMIN_FLAG_KEY = "is_admin";
export const ROLE_KEY = "role";

export const getAccess = () => localStorage.getItem(ACCESS_KEY);
export const getRefresh = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ADMIN_FLAG_KEY);
  localStorage.removeItem(ROLE_KEY);
};
