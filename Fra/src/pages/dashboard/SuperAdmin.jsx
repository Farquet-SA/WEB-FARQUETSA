import { useEffect, useState } from "react";
import { getPaginacionConfig, setPaginacionConfig } from "../../api/products";
import { toast } from "sonner";

const OPCIONES = [4, 8, 12, 16, 20, 24, 32, 48];

export default function SuperAdmin() {
  const [valor, setValor] = useState(8);
  const [custom, setCustom] = useState("");
  const [modo, setModo] = useState("preset"); // "preset" | "custom"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPaginacionConfig();
        const v = data?.productos_por_pagina ?? 8;
        setValor(v);
        if (!OPCIONES.includes(v)) {
          setModo("custom");
          setCustom(String(v));
        }
      } catch {
        toast.error("No se pudo cargar la configuración");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGuardar = async () => {
    const nuevo = modo === "custom" ? parseInt(custom, 10) : valor;
    if (!nuevo || nuevo < 1 || nuevo > 100) {
      toast.error("El valor debe ser un número entre 1 y 100.");
      return;
    }
    try {
      setSaving(true);
      await setPaginacionConfig(nuevo);
      setValor(nuevo);
      toast.success(`Ahora se mostrarán ${nuevo} productos por página.`);
    } catch {
      toast.error("Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ margin: "0 0 4px", color: "#0b2b4b", fontSize: 22 }}>
        Configuración de Paginación
      </h2>
      <p style={{ margin: "0 0 28px", color: "#56657a", fontSize: 14 }}>
        Define cuántos productos se muestran por página en el catálogo público.
        Este ajuste solo lo pueden cambiar los superadministradores.
      </p>

      {loading ? (
        <p style={{ color: "#56657a" }}>Cargando configuración…</p>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #dce8f5",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 4px 16px rgba(2,32,71,0.07)",
          }}
        >
          {/* Selector de modo */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => setModo("preset")}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 10,
                border: "1.5px solid",
                borderColor: modo === "preset" ? "#1a3a5c" : "#dce8f5",
                background: modo === "preset" ? "#1a3a5c" : "#f6f9fd",
                color: modo === "preset" ? "#fff" : "#56657a",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.18s",
              }}
            >
              Valores rápidos
            </button>
            <button
              onClick={() => setModo("custom")}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 10,
                border: "1.5px solid",
                borderColor: modo === "custom" ? "#1a3a5c" : "#dce8f5",
                background: modo === "custom" ? "#1a3a5c" : "#f6f9fd",
                color: modo === "custom" ? "#fff" : "#56657a",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.18s",
              }}
            >
              Valor personalizado
            </button>
          </div>

          {modo === "preset" ? (
            <>
              <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#1a3a5c", fontSize: 14 }}>
                Productos por página
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {OPCIONES.map((op) => (
                  <button
                    key={op}
                    onClick={() => setValor(op)}
                    style={{
                      padding: "12px 0",
                      borderRadius: 12,
                      border: "1.5px solid",
                      borderColor: valor === op ? "#1a3a5c" : "#dce8f5",
                      background: valor === op ? "#1a3a5c" : "#f6f9fd",
                      color: valor === op ? "#fff" : "#1a3a5c",
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: "0 0 10px", fontWeight: 600, color: "#1a3a5c", fontSize: 14 }}>
                Número de productos (1–100)
              </p>
              <input
                type="number"
                min={1}
                max={100}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Ej. 15"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #dce8f5",
                  fontSize: 16,
                  color: "#1a3a5c",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 20,
                }}
              />
            </>
          )}

          {/* Vista previa del valor activo */}
          <div
            style={{
              background: "#f0f6ff",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>📄</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#56657a" }}>Valor guardado actualmente</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a3a5c" }}>
                {valor} productos por página
              </p>
            </div>
          </div>

          <button
            onClick={handleGuardar}
            disabled={saving}
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 12,
              border: "none",
              background: saving ? "#7a9dbf" : "#1a3a5c",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: saving ? "not-allowed" : "pointer",
              transition: "background 0.18s",
            }}
          >
            {saving ? "Guardando…" : "Guardar configuración"}
          </button>
        </div>
      )}
    </div>
  );
}
