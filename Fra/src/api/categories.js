import api from "./axios";

export const getCategories = async () => {
  const { data } = await api.get("/categorias/");
  return data?.results ?? data;
};

export const createCategory = async (payload) => {
  const { data } = await api.post("/categorias/", payload);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/categorias/${id}/`, payload);
  return data;
};

export const deleteCategory = async (id) => {
  await api.delete(`/categorias/${id}/`);
};
