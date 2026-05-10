import api from "./axios";

export const getProducts = async (page = 1) => {
  const { data } = await api.get(`/products/?page=${page}`);
  return data; // { count, next, previous, results }
};

export const getCategories = async () => {
  const { data } = await api.get("/categorias/");
  return data?.results ?? data;
};

export const uploadProductImage = async (file) => {
  const payload = new FormData();
  payload.append("file", file, file.name || "upload.jpg");
  const { data } = await api.post("/uploads/product-image/", payload);
  return data?.url || "";
};

export const createProduct = async (payload) => {
  const { data } = await api.post("/products/", payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}/`, payload);
  return data;
};

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}/`);
};

// Configuración de paginación — solo admin
export const getPaginacionConfig = async () => {
  const { data } = await api.get("/configuracion-paginacion/");
  return data; // { productos_por_pagina }
};

export const setPaginacionConfig = async (productos_por_pagina) => {
  const { data } = await api.post("/configuracion-paginacion/", { productos_por_pagina });
  return data;
};
