import { useState } from "react";
import "./productCard.css";

export default function ProductCard({ product, onAdd }) {
  const [open, setOpen] = useState(false);
  const price = Number(product.precio || 0);

  const normalizeEstado = () => {
    const raw = String(product.estado ?? "").trim().toLowerCase();
    if (raw.includes("des") || raw.includes("discont")) return "DESCONTINUADO";
    if (raw.includes("agot")) return "AGOTADO";
    if (raw.includes("disp")) return "DISPONIBLE";
    const disp = product.disponible ?? true;
    return disp ? "DISPONIBLE" : "AGOTADO";
  };

  const estado = normalizeEstado();
  const badge = {
    text: estado === "DISPONIBLE" ? "Disponible" : estado === "AGOTADO" ? "Agotado" : "Descontinuado",
    cls: estado === "DISPONIBLE" ? "ok" : estado === "AGOTADO" ? "warn" : "off",
  };
  const categoria = product.categoria_nombre || "Otros";
  const canAdd = estado === "DISPONIBLE";

  const handleAdd = () => {
    onAdd?.(product);
    setOpen(false);
  };

  return (
    <>
      {/* ── Card ─────────────────────────────────────── */}
      <div className="pCard" onClick={() => setOpen(true)}>
        <div className="pImg">
          <img
            src={product.imagen || "https://via.placeholder.com/600x400?text=Producto"}
            alt={product.nombre}
            loading="lazy"
          />
          <span className={`pBadge ${badge.cls}`}>{badge.text}</span>
        </div>

        <div className="pBody">
          <div className="pCategory">{categoria.toUpperCase()}</div>
          <div className="pTitle">{product.nombre}</div>
          <div className="pBottom">
            <div className="pPrice">Q{price.toFixed(2)}</div>
            <button
              className="pBtn"
              disabled={!canAdd}
              onClick={(e) => {
                e.stopPropagation();
                if (canAdd) onAdd?.(product);
              }}
            >
              {canAdd ? "Agregar" : "No disponible"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────── */}
      {open && (
        <div className="modalOverlay" onClick={() => setOpen(false)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <button className="modalClose" onClick={() => setOpen(false)}>✕</button>

            <div className="modalImg">
              <img
                src={product.imagen || "https://via.placeholder.com/600x400?text=Producto"}
                alt={product.nombre}
              />
            </div>

            <div className="modalContent">
              <div className="pCategory" style={{ marginBottom: 6 }}>{categoria.toUpperCase()}</div>
              <h2 className="modalTitle">{product.nombre}</h2>
              <p className="modalDesc">{product.descripcion || "Sin descripción."}</p>
              {(product.formula || product.registro || product.presentacion) && (
              <div className="modalExtra">
                {product.formula && (
                  <div className="modalExtraRow">
                    <span className="modalExtraLabel">Fórmula</span>
                    <span>{product.formula}</span>
                  </div>
                )}
                {product.registro && (
                  <div className="modalExtraRow">
                    <span className="modalExtraLabel">Registro</span>
                    <span>{product.registro}</span>
                  </div>
                )}
                {product.presentacion && (
                  <div className="modalExtraRow">
                    <span className="modalExtraLabel">Presentación</span>
                    <span>{product.presentacion}</span>
                  </div>
                )}
              </div>
            )}

              <div className="modalBottom">
                <div className="modalPrice">Q{price.toFixed(2)}</div>
                <button className="pBtn" style={{ flex: 1, height: 44 }} disabled={!canAdd} onClick={handleAdd}>
                  {canAdd ? "Agregar al carrito" : badge.text}
                </button>
              </div>
              <span className={`pBadge ${badge.cls}`} style={{ position: "static", marginTop: 10, alignSelf: "flex-start" }}>{badge.text}</span>

              
                
              
            </div>
          </div>
        </div>
      )}
    </>
  );
}
