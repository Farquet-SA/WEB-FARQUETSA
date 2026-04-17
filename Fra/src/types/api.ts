// Interfaces centrales que reflejan los modelos del backend (BAC/catalogo/models.py)

export type ProductoEstado = "disponible" | "agotado" | "descontinuado";

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string; // DecimalField llega como string desde DRF
  imagen: string;
  formula: string;
  registro: string;
  presentacion: string;
  categoria: number | null;
  estado: ProductoEstado;
  disponible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Servicio {
  id: number;
  icon: string;
  title: string;
  text: string;
}

export interface PasoProceso {
  id: number;
  numero: string;
  title: string;
  text: string;
}

export interface Confianza {
  id: number;
  icon: string;
  title: string;
  text: string;
}

export interface ImagenInformacion {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  orden: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export type HistorialModulo = "categorias" | "productos" | "usuarios";

export interface Historial {
  id: number;
  modulo: HistorialModulo;
  accion: string;
  descripcion: string;
  usuario: number | null;
  fecha: string;
}

export interface ConfiguracionSistema {
  meses_retencion_historial: number;
}

export interface ContactoPayload {
  nombre: string;
  email: string;
  mensaje: string;
}

// Re-exportadas desde api/auth.ts para centralizar todo en types/
export type { AdminUser, LoginResult } from "../api/auth";
