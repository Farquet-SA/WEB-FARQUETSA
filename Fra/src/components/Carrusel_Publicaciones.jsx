import { useState, useEffect, useCallback } from "react";
import styles from "./Carrusel_Publicaciones.module.css";

export default function PublicacionesCarrusel({ publicaciones }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);

  const n = publicaciones.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % n), [n]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + n) % n), [n]);

  useEffect(() => {
    if (selected) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next, selected]);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  if (!n) return null;

  function getPos(i) {
    const diff = (((i - current) % n) + n) % n;
    return diff <= n / 2 ? diff : diff - n;
  }

  const sorted = publicaciones
    .map((pub, i) => ({ pub, i, pos: getPos(i) }))
    .sort((a, b) => Math.abs(b.pos) - Math.abs(a.pos));

  function cardClass(pos) {
    if (pos === 0) return `${styles.card} ${styles.main}`;
    if (pos === 1) return `${styles.card} ${styles.next}`;
    if (pos === -1) return `${styles.card} ${styles.prev}`;
    return `${styles.card} ${styles.far}`;
  }

  const preview = (pub) =>
    (pub.text || "").split("\n").find((l) => l.trim()) || "Sin descripción.";

  return (
    <>
      <section style={{ padding: 0 }}>
        <div className={styles.scene}>
          <div className={styles.track}>
            {sorted.map(({ pub, i, pos }) => (
              <div
                key={i}
                className={cardClass(pos)}
                onClick={() => {
                  if (pos === 0) setSelected(pub);
                  else setCurrent(i);
                }}
              >
                <img
                  src={
                    pub.image ||
                    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={pub.title}
                  loading="lazy"
                />
                <div className={styles.overlay}>
                  <h3>{pub.title}</h3>
                  <p>{preview(pub)}</p>
                  <button type="button">Ver más</button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.controls}>
            <button
              className={styles.ctrlBtn}
              onClick={prev}
              aria-label="Anterior"
            >
              ‹
            </button>
            <div className={styles.dots}>
              {publicaciones.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot}${i === current ? ` ${styles.dotActive}` : ""}`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Ir a publicación ${i + 1}`}
                />
              ))}
            </div>
            <button
              className={styles.ctrlBtn}
              onClick={next}
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {selected && (
        <div className={styles.backdrop} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalImg}>
              <img
                src={
                  selected.image ||
                  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80"
                }
                alt={selected.title}
              />
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalHeader}>
                <h2>{selected.title}</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setSelected(null)}
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              {(selected.text || "Descripción no disponible.")
                .split("\n")
                .filter((l) => l.trim())
                .map((line, i) => (
                  <p
                    key={i}
                    className="muted"
                    style={{ marginBottom: "0.75rem" }}
                  >
                    {line}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
