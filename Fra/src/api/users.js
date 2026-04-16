import api from "./axios";

export const getUsers = async () => {
  const { data } = await api.get(`/usuarios/`);
  return data?.results ?? data;
};

export const createUser = async (payload) => {
  const { data } = await api.post(`/usuarios/`, payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/usuarios/${id}/`, payload);
  return data;
};

export const deleteUser = async (id) => {
  await api.delete(`/usuarios/${id}/`);
};
