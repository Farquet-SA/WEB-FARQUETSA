import api from "./axios";

export const getProducts = async (page = 1, filters = {}) => {
  const params = new URLSearchParams({ page: String(page) });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const { data } = await api.get(`/products/?${params.toString()}`);
  return data; // { count, next, previous, results }
};

export const getAllProducts = async (filters = {}) => {
  const all = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= 100) {
    const data = await getProducts(page, filters);
    const results = Array.isArray(data) ? data : data?.results ?? [];
    all.push(...results);
    hasNext = Boolean(data?.next);
    page += 1;
  }

  return all;
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
