import api from "./axios";

export const enviarContacto = async (payload) => {
  const { data } = await api.post("/contacto/", payload);
  return data;
};