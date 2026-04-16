import api from "./axios";

export const getHistorial = async (filtro) => {
  const { data } = await api.get("/historial/", { params: filtro });
  return data?.results ?? data;
};

export const tiempodelimpieza = async (meses) => {
    await api.post("/configuracion-limpieza/", { meses });
};

export const getTiempoLimpieza = async () => {
    const { data } = await api.get("/configuracion-limpieza/");
    return data.meses;
};
