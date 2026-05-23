import { useState, useEffect, useCallback, useRef } from "react";

const getVisibleCount = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 680) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
};

const getVideoEmbedUrl = (url = "") => {
  const value = String(url).trim();
  if (!value) return "";

  const youtubeMatch = value.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const tiktokMatch = value.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (tiktokMatch?.[1]) {
    return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
  }

  return "";
};

const fallbackImage =
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80";

function PublicationMedia({ pub, large = false, interactive = false }) {
  const embedUrl = getVideoEmbedUrl(pub.video_url);

  if (embedUrl) {
    return (
      <div
        style={{
          width: "100%",
          height: large ? "min(58vh, 520px)" : 180,
          minHeight: large ? 280 : 180,
          background: "#061d36",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <iframe
          src={embedUrl}
          title={pub.title ? `Video de ${pub.title}` : "Video de publicación"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
            pointerEvents: interactive ? "auto" : "none",
          }}
        />
        {!interactive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              background: "linear-gradient(180deg, rgba(6,29,54,.05), rgba(6,29,54,.25))",
              pointerEvents: "none",
            }}
          >
            Ver video
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={pub.image || fallbackImage}
      alt={pub.title}
      style={{
        width: "100%",
        height: large ? "auto" : 180,
        maxHeight: large ? "55vh" : undefined,
        objectFit: large ? "contain" : "cover",
        display: "block",
        margin: large ? "0 auto" : undefined,
      }}
    />
  );
}

export default function PublicacionesCarrusel({ publicaciones }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(getVisibleCount);
  const trackRef = useRef(null);

  const total = publicaciones.length;
  const visibleSlots = Math.min(visible, Math.max(total, 1));
  const canSlide = total > visibleSlots;

  const prev = useCallback(() => {
    if (!total) return;
    setCurrent(c => (c - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    if (!total) return;
    setCurrent(c => (c + 1) % total);
  }, [total]);

  useEffect(() => {
    if (selected || !canSlide) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [canSlide, next, selected]);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  useEffect(() => {
    const handleResize = () => setVisible(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrent((value) => (total ? Math.min(value, total - 1) : 0));
  }, [total]);

  if (!publicaciones.length) return null;


  const items = canSlide ? [...publicaciones, ...publicaciones, ...publicaciones] : publicaciones;
  const offset = canSlide ? current + publicaciones.length : 0;

  return (
    <>
      <section className="section">
        <div className="container">
          <div style={{ position: "relative" }}>

            {/* Track */}
            <div style={{ overflow: "hidden", borderRadius: 16 }}>
              <div
                ref={trackRef}
                style={{
                  display: "flex",
                  gap: 20,
                  justifyContent: canSlide ? "flex-start" : "center",
                  transform: canSlide
                    ? `translateX(calc(-${offset * (100 / visibleSlots)}% - ${offset * 20 / visibleSlots}px))`
                    : "none",
                  transition: canSlide ? "transform 0.5s ease" : "none",
                }}
              >
                {items.map((pub, i) => {
                  const preview = (pub.text || "")
                    .split("\n")
                    .find(line => line.trim() !== "") || "Sin descripción.";

                  return (
                    <div
                      key={`${pub.id ?? pub.title}-${i}`}
                      onClick={() => setSelected(pub)}
                      style={{
                        minWidth: `calc(${100 / visibleSlots}% - ${20 * (visibleSlots - 1) / visibleSlots}px)`,
                        maxWidth: canSlide ? undefined : 420,
                        cursor: "pointer",
                        borderRadius: 16,
                        overflow: "hidden",
                        border: "1px solid var(--line)",
                        boxShadow: "var(--shadow-lg)",
                        background: "#fff",
                        flexShrink: 0,
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <PublicationMedia pub={pub} />
                      <div style={{ padding: "14px 16px" }}>
                        <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#0b2b4b", fontSize: 15 }}>
                          {pub.title}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: 13,
                          color: "#5c6b7b",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {preview}
                          
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            
            {canSlide && (
              <button
                type="button"
                onClick={prev}
                style={{
                  position: "absolute",
                  left: -18,
                  top: "45%",
                  transform: "translateY(-50%)",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1px solid #e5edf7",
                  background: "#fff",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  fontSize: 20,
                  color: "#0b2b4b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >‹</button>
            )}

           
            {canSlide && (
              <button
                type="button"
                onClick={next}
                style={{
                  position: "absolute",
                  right: -18,
                  top: "45%",
                  transform: "translateY(-50%)",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1px solid #e5edf7",
                  background: "#fff",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  fontSize: 20,
                  color: "#0b2b4b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >›</button>
            )}

            {canSlide && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                {publicaciones.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrent(i)}
                    style={{
                      width: i === current ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      border: "none",
                      background: i === current ? "#0b2b4b" : "#c9d8ee",
                      cursor: "pointer",
                      padding: 0,
                      transition: "width 0.3s, background 0.3s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              maxWidth: 780,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{
              width: "100%",
              background: "#f0f4f8",
              borderRadius: "20px 20px 0 0",
              overflow: "hidden",
            }}>
              <PublicationMedia pub={selected} large interactive />
            </div>

            <div style={{ padding: "24px 28px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <h2 style={{ margin: 0, color: "#0b2b4b", fontSize: 20, lineHeight: 1.3 }}>
                  {selected.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  style={{
                    background: "#f0f4f8",
                    border: "none",
                    borderRadius: 10,
                    width: 34,
                    height: 34,
                    fontSize: 18,
                    cursor: "pointer",
                    color: "#0b2b4b",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}
                >✕</button>
              </div>

              <div style={{ textAlign: "justify" }}>
                {(selected.text || "Descripción no disponible.")
                  .split("\n")
                  .filter(line => line.trim() !== "")
                  .map((line, i) => (
                    <p key={i} className="muted" style={{ marginBottom: "0.75rem" }}>
                      {line}
                    </p>
                  ))}
                  {selected.icon}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
