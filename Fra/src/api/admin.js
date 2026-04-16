import api from "./axios";

export const getAdmins = async () => {
  const { data } = await api.get("/admins/");
  return data?.results ?? data;
};

export const getAdmin = async (id) => {
  const { data } = await api.get(`/admins/${id}/`);
  return data;
};

export const createAdmin = async (data) => {
  const { data: response } = await api.post("/admins/", data);
  return response;
};
export const updateAdmin = async (id, data) => {
  const { data: response } = await api.put(`/admins/${id}/`, data);
  return response;
};
export const deleteAdmin = async (id) => {
  await api.delete(`/admins/${id}/`);
};
