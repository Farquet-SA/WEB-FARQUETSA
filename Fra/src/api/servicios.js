import api from "./axios";

export const getServicios = async () => {
  const { data } = await api.get("/servicios/");
  return data?.results ?? data;
};

export const createServicio = async (payload) => {
  const { data } = await api.post("/servicios/", payload);
  return data;
};

export const updateServicio = async (id, payload) => {
  const { data } = await api.put(`/servicios/${id}/`, payload);
  return data;
};

export const deleteServicio = async (id) => {
  await api.delete(`/servicios/${id}/`);
};


export const getPasos = async () => {
  const { data } = await api.get("/pasos/");
  return data;
};

export const createPaso = async (payload) => {
  const { data } = await api.post("/pasos/", payload);
  return data;
};

export const updatePaso = async (id, payload) => {
  const { data } = await api.patch(`/pasos/${id}/`, payload);
  return data;
};

export const deletePaso = async (id) => {
  await api.delete(`/pasos/${id}/`);
};



export const getConfianza = async () => {
  const { data } = await api.get("/confianza/");
  return data;
};

export const createConfianza = async (payload) => {
  const { data } = await api.post("/confianza/", payload);
  return data;
};

export const updateConfianza = async (id, payload) => {
  const { data } = await api.patch(`/confianza/${id}/`, payload);
  return data;
};

export const deleteConfianza = async (id) => {
  await api.delete(`/confianza/${id}/`);
};

export const getPublicaciones = async () => {
  const { data } = await api.get("/publicaciones/");
  return data;
};

export const createPublicacion = async (payload) => {
  const { data } = await api.post("/publicaciones/", payload);
  return data;
};

export const updatePublicacion = async (id, payload) => {
  const { data } = await api.put(`/publicaciones/${id}/`, payload);
  return data;
};

export const uploadProductImage = async (file) => {
  const payload = new FormData();
  payload.append("file", file, file.name || "upload.jpg");
  const { data } = await api.post("/uploads/product-image/", payload);
  return data?.url || "";
};

export const deletePublicacion = async (id) => {
  await api.delete(`/publicaciones/${id}/`);
};