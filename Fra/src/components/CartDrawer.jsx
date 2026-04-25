import { useMemo } from "react";
import { useCart } from "../context/CartContext";
import "./cartDrawer.css";

export default function CartDrawer() {
  const { items, subtotal, count, isOpen, close, inc, dec, setQty, normalizeQty, removeItem, clear } = useCart();
  const total = subtotal;

  const whatsappText = useMemo(() => {
    if (items.length === 0) return "";

    const lines = items.map((x) => {
      const lineTotal = (Number(x.precio) || 0) * (Number(x.qty) || 0);
      return `• ${x.nombre} x${x.qty} = Q${lineTotal.toFixed(2)}`;
    });

    return encodeURIComponent(
      [
        "Hola, me gustaría una cotización:",
        "",
        ...lines,
        "",
        `Total estimado: Q${total.toFixed(2)}`,
      ].join("\n")
    );
  }, [items, total]);

  const waHref =
    items.length === 0 ? undefined : `https://wa.me/50242955547?text=${whatsappText}`;

  return (
    <>
      <div className={`cdOverlay ${isOpen ? "show" : ""}`} onClick={close} />

      <aside
        className={`cdDrawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de cotización"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cdHeader">
          <div>
            <h3>Cotización</h3>
            <p>
              {count} {count === 1 ? "artículo" : "artículos"}
            </p>
          </div>
          <button className="cdClose" type="button" onClick={close} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>

        <div className="cdBody">
          {items.length === 0 ? (
            <div className="cdEmpty">
              <strong>Tu cotización está vacía</strong>
              <p>Agrega productos para calcular tu total estimado.</p>
            </div>
          ) : (
            items.map((x) => (
              <div className="cdItem" key={x.id}>
                <div className="cdThumb">
                  <img src={x.imagen || "https://via.placeholder.com/80"} alt={x.nombre} />
                </div>

                <div className="cdInfo">
                  <div className="cdName">{x.nombre}</div>
                  <div className="cdUnit">Q{(Number(x.precio) || 0).toFixed(2)} c/u</div>

                  <div className="cdQtyRow">
                    <button
                      type="button"
                      onClick={() => dec(x.id)}
                      className="cdQtyBtn"
                      aria-label={`Disminuir cantidad de ${x.nombre}`}
                    >
                      −
                    </button>

                    <input
                      className="cdQtyInput"
                      type="text"
                      inputMode="numeric"
                      value={x.qty}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d+$/.test(value)) {
                          setQty(x.id, value);
                        }
                      }}
                      onBlur={() => normalizeQty(x.id)}
                      aria-label={`Cantidad de ${x.nombre}`}
                    />

                    <button
                      type="button"
                      onClick={() => inc(x.id)}
                      className="cdQtyBtn"
                      aria-label={`Aumentar cantidad de ${x.nombre}`}
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(x.id)}
                      className="cdTrash"
                      title="Quitar producto"
                      aria-label={`Quitar ${x.nombre}`}
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <div className="cdLineTotal">
                  Q{(((Number(x.precio) || 0) * (Number(x.qty) || 0)) || 0).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer solo si hay items (más pro) */}
        {items.length > 0 && (
          <div className="cdFooter">
            <button className="cdClear" type="button" onClick={clear}>
              Vaciar cotización
            </button>

            <div className="cdTotals">
              <div className="row">
                <span>Artículos</span>
                <strong>{count}</strong>
              </div>

              <div className="row total">
                <span>Total estimado</span>
                <strong>Q{total.toFixed(2)}</strong>
              </div>
            </div>

            <a className="cdWhats" href={waHref} target="_blank" rel="noreferrer">
              <span style={{ fontSize: 18 }}>💬</span>
              Enviar por WhatsApp
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
