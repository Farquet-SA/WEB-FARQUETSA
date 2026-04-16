import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import "./home.css";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const slides = useMemo(
    () => [
      {
        img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1800&q=80",
        title: "Tu Farmacia de Confianza en Guatemala",
        subtitle:
          "Medicamentos, salud y bienestar. Atención rápida, confiable y cercana.",
      },
      {
        img: "https://elglobalfarma.com/wp-content/uploads/2024/10/GettyImages-878852718.jpg",
        title: "Catálogo actualizado y disponible",
        subtitle: "Productos por estado y cotización rápida en minutos.",
      },
      {
        img: "https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=1800&q=80",
        title: "Atención personalizada",
        subtitle: "Te asesoramos para elegir lo que necesitas con confianza.",
      },
    ],
    []
  );

  const highlights = useMemo(
    () => [
      {
        icon: "📦",
        title: "Distribución al por mayor",
        desc: "Abastecimiento para farmacias, clínicas y negocios locales.",
        cta: { label: "Ver más", to: "/servicios" },
      },
      {
        icon: "🚚",
        title: "Envíos disponibles",
        desc: "Entrega a domicilio según zona y disponibilidad.",
        cta: { label: "Consultar", to: "/contacto" },
      },
      {
        icon: "🧾",
        title: "Cotización rápida",
        desc: "Arma tu cotización desde el catálogo en minutos.",
        cta: { label: "Cotizar", to: "/productos" },
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [pendingIdx, setPendingIdx] = useState(null);

  const nextIdx = (idx + 1) % slides.length;
  const current = slides[idx];
  const next = slides[nextIdx];

  // Autoplay
  useEffect(() => {
    const t = setInterval(() => {
      setPendingIdx(nextIdx);
      setIsSliding(true);
    }, 5200);

    return () => clearInterval(t);
  }, [nextIdx]);

  const handleTransitionEnd = () => {
    if (!isSliding) return;
    setIdx(pendingIdx ?? nextIdx);
    setIsSliding(false);
    setPendingIdx(null);
  };

  // Productos
  useEffect(() => {
    (async () => {
      try {
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : data?.results ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const featured = useMemo(() => {
    const filtered = products.filter((p) =>
      (p?.nombre ?? "").toLowerCase().includes(q.toLowerCase())
    );
    return filtered.slice(0, 4);
  }, [products, q]);

  const goSearch = (e) => {
    e.preventDefault();
    const qq = q.trim();
    navigate(qq ? `/productos?q=${encodeURIComponent(qq)}` : "/productos");
  };

  return (
    <div className="home">
      {/* HERO */}
      <section className="heroV2">
        <div
          className={`heroTrack ${isSliding ? "sliding" : ""}`}
          onTransitionEnd={handleTransitionEnd}
        >
          <div
            className="heroSlide"
            style={{ backgroundImage: `url(${current.img})` }}
          />
          <div
            className="heroSlide"
            style={{ backgroundImage: `url(${next.img})` }}
          />
        </div>

        <div className="heroShade" />

        <div className="heroContent">
          <div className="container">
            <div className="heroKicker">FARQUETSA • Farmacéutica S.A</div>

            <h1>{current.title}</h1>
            <p>{current.subtitle}</p>

            {/* Buscador (sin botones redundantes) */}
            <form className="heroSearch" onSubmit={goSearch}>
              <span className="heroSearchIcon">🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar medicamentos, productos..."
              />
              <button className="btnSearch" type="submit">
                Buscar
              </button>
            </form>

            <div className="dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === idx ? "active" : ""}`}
                  onClick={() => {
                    setIsSliding(false);
                    setPendingIdx(null);
                    setIdx(i);
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Accesos principales */}
            <div className="heroHighlights">
              {highlights.map((h) => (
                <div className="hCard" key={h.title}>
                  <div className="hIcon">{h.icon}</div>
                  <div className="hText">
                    <div className="hTitle">{h.title}</div>
                    <div className="hDesc">{h.desc}</div>
                  </div>
                  <Link className="hCta" to={h.cta.to}>
                    {h.cta.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE PRO: 20 AÑOS */}
      <section className="section">
        <div className="container split">
          <div className="splitLeft">
            <div className="imgCard">
              <img
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80"
                alt="Farmacia"
              />
            </div>
          </div>

          <div className="splitRight">
            <div className="kicker">Experiencia</div>
            <h2 className="bigTitle">Más de 20 Años Sirviendo a Guatemala</h2>
            <p className="muted">
              En Farquetsa S.A, nos dedicamos a proporcionar los mejores
              productos farmacéuticos y servicios de salud a toda Guatemala.
              Nuestro equipo está listo para ayudarte con atención personalizada.
            </p>

            <div className="featureList">
              <div className="featureItem">
                <div className="checkIcon">✓</div>
                <div>
                  <strong>Farmacéuticos Certificados en Guatemala</strong>
                  <div className="muted smallText">
                    Personal calificado con años de experiencia
                  </div>
                </div>
              </div>

              <div className="featureItem">
                <div className="checkIcon">✓</div>
                <div>
                  <strong>Productos de Calidad Internacional</strong>
                  <div className="muted smallText">
                    Solo trabajamos con marcas y laboratorios confiables
                  </div>
                </div>
              </div>

              <div className="featureItem">
                <div className="checkIcon">✓</div>
                <div>
                  <strong>Atención en Toda Guatemala</strong>
                  <div className="muted smallText">
                    Servicio rápido y contacto directo para cotizaciones
                  </div>
                </div>
              </div>
            </div>

            <div className="splitActions">
              <Link className="btnOutline" to="/contacto">
                Contacto
              </Link>
              <Link className="btnPrimary" to="/productos">
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INFO EMPRESA */}
      <section className="section soft">
        <div className="container">
          <div className="sectionHead">
            <div>
              <div className="kicker">Nosotros</div>
              <h2>¿Quiénes Somos?</h2>
              <p className="muted">
                Somos una empresa comprometida con brindar productos de calidad y
                atención cercana. Nuestro enfoque es servir a cada cliente con
                confianza y responsabilidad.
              </p>
            </div>
          </div>

          <div className="grid3">
            <div className="cardInfo">
              <div className="cardTop">
                <span className="chip">Historia</span>
              </div>
              <p>
                FARQUETSA nace con el objetivo de acercar medicamentos y asesoría,
                priorizando la atención humana y la rapidez.
              </p>
            </div>

            <div className="cardInfo">
              <div className="cardTop">
                <span className="chip">Misión</span>
              </div>
              <p>
                Brindar acceso a productos farmacéuticos confiables, con servicio
                ágil y orientación responsable.
              </p>
            </div>

            <div className="cardInfo">
              <div className="cardTop">
                <span className="chip">Visión</span>
              </div>
              <p>
                Ser referente por nuestra atención, innovación y disponibilidad
                de productos, creciendo junto a la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS (preview) */}
      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <div>
              <div className="kicker">Servicios</div>
              <h2>Nuestros Servicios</h2>
              <p className="muted">
                Atención, abastecimiento y soluciones rápidas para clientes y negocios.
              </p>
            </div>

            <Link className="btnSmall" to="/servicios">
              Ver todos
            </Link>
          </div>

          <div className="grid3">
            <div className="serviceCard">
              <div className="svcTop">
                <div className="svcIcon">📦</div>
                <h3>Distribución al por mayor</h3>
              </div>
              <p className="muted">
                Abastecimiento para farmacias, clínicas y negocios locales.
              </p>
            </div>

            <div className="serviceCard">
              <div className="svcTop">
                <div className="svcIcon">✅</div>
                <h3>Catálogo por disponibilidad</h3>
              </div>
              <p className="muted">
                Productos actualizados, disponibles y por estado.
              </p>
            </div>

            <div className="serviceCard">
              <div className="svcTop">
                <div className="svcIcon">🚚</div>
                <h3>Envíos y cotizaciones</h3>
              </div>
              <p className="muted">
                Cotización rápida y coordinación de entrega según zona.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="section soft">
        <div className="container">
          <div className="centerHead">
            <div className="kicker">Catálogo</div>
            <h2>Productos Destacados</h2>
            <p>Encuentra los mejores productos farmacéuticos disponibles.</p>
          </div>

          <div className="gridProducts">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="centerCta">
            <Link className="btnPrimary" to="/api/productos">
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
