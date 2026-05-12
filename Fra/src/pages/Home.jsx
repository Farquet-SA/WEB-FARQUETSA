import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../api/products";
import { useCart } from "../context/CartContext";
import "./home.css";
import { Link, useNavigate } from "react-router-dom";
import { getPublicaciones } from "../api/servicios";
import PublicacionesCarrusel from "../components/Carrusel_Publicaciones";

function FeaturedProductCard({ product, onAdd }) {
  const price = Number(product.precio || 0);
  const categoria = product.categoria_nombre || "Otros";
  const estado = String(product.estado || "disponible").toLowerCase();
  const available = estado !== "agotado" && estado !== "descontinuado";

  return (
    <article className="featuredProductCard">
      <div className="featuredProductTop">
        <span className={`featuredProductBadge ${available ? "ok" : "off"}`}>
          {available ? "Disponible" : "No disponible"}
        </span>
      </div>

      <div className="featuredProductImage">
        <img
          src={product.imagen || "https://via.placeholder.com/600x420?text=Producto"}
          alt={product.nombre}
          loading="eager"
          decoding="async"
        />
      </div>

      <div className="featuredProductBody">
        <div className="featuredProductCategory">{categoria.toUpperCase()}</div>
        <h3>{product.nombre}</h3>
        <p>{product.descripcion || "Producto farmacéutico disponible para cotización."}</p>
        <strong>Q {price.toFixed(2)}</strong>
        <button
          type="button"
          disabled={!available}
          onClick={(event) => {
            event.stopPropagation();
            onAdd(product);
          }}
        >
          <svg
            className="featuredCartIcon"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M5 6h2l1.25 8.25a2 2 0 0 0 1.98 1.75h6.9a2 2 0 0 0 1.92-1.45L20 11H8.1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 20h.01M17 20h.01"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublicaciones();
        setPublicaciones(Array.isArray(data) ? data : data?.results ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const slides = useMemo(
    () => [
      {
        img: "/hero/farquetsa-hero-1.jpg",
        title: "Tu Farmacia de Confianza en Guatemala",
        subtitle:
          "Medicamentos, salud y bienestar. Atención rápida, confiable y cercana.",
      },
      {
        img: "/hero/farquetsa-hero-2.jpg",
        title: "Catálogo actualizado y disponible",
        subtitle: "Productos por estado y cotización rápida en minutos.",
      },
      {
        img: "/hero/farquetsa-hero-3.jpg",
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
  const [featuredIdx, setFeaturedIdx] = useState(0);

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
        const destacados = await getProducts(1, { destacado: true });
        const destacadosResults = Array.isArray(destacados)
          ? destacados
          : destacados?.results ?? [];

        if (destacadosResults.length > 0) {
          setProducts(destacadosResults);
          return;
        }

        const catalogo = await getProducts(1);
        setProducts(Array.isArray(catalogo) ? catalogo : catalogo?.results ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const featured = useMemo(() => {
    const filtered = products.filter((p) =>
      (p?.nombre ?? "").toLowerCase().includes(q.toLowerCase())
    );
    return filtered.slice(0, 5);
  }, [products, q]);

  const activeFeaturedIdx = featured.length ? featuredIdx % featured.length : 0;

  const moveFeatured = (direction) => {
    if (!featured.length) return;
    setFeaturedIdx((currentIndex) =>
      (currentIndex + direction + featured.length) % featured.length
    );
  };

  const getFeaturedPosition = (index) => {
    if (featured.length === 1) return "center";
    let distance = index - activeFeaturedIdx;
    const half = featured.length / 2;
    if (distance > half) distance -= featured.length;
    if (distance < -half) distance += featured.length;
    if (distance === 0) return "center";
    if (distance === -1) return "leftOne";
    if (distance === 1) return "rightOne";
    if (distance < 0) return "leftTwo";
    return "rightTwo";
  };

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

      {/* PRODUCTOS DESTACADOS */}
      <section className="section soft featuredProducts">
        <div className="container">
          <div className="centerHead">
            <div className="kicker">Destacados</div>
            <h2>Productos Destacados</h2>
            <p>Encuentra los mejores productos farmacéuticos disponibles.</p>
          </div>

          {featured.length > 0 && (
            <div className="featuredShowcase" aria-label="Productos destacados">
              {featured.length > 1 && (
                <button
                  className="featuredArrow featuredArrowLeft"
                  type="button"
                  onClick={() => moveFeatured(-1)}
                  aria-label="Producto destacado anterior"
                >
                  ‹
                </button>
              )}

              <div className="featuredOrbit" aria-hidden="true" />
              <div className="featuredStage">
                {featured.map((p, index) => (
                  <div
                    className={`featuredSlot ${getFeaturedPosition(index)}`}
                    key={p.id}
                  >
                    <FeaturedProductCard product={p} onAdd={addItem} />
                  </div>
                ))}
              </div>

              {featured.length > 1 && (
                <button
                  className="featuredArrow featuredArrowRight"
                  type="button"
                  onClick={() => moveFeatured(1)}
                  aria-label="Siguiente producto destacado"
                >
                  ›
                </button>
              )}

              {featured.length > 1 && (
                <div className="featuredDots" aria-label="Seleccionar destacado">
                  {featured.map((p, index) => (
                    <button
                      key={p.id}
                      className={index === activeFeaturedIdx ? "active" : ""}
                      type="button"
                      onClick={() => setFeaturedIdx(index)}
                      aria-label={`Ver producto destacado ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="centerCta">
            <Link className="btnPrimary" to="/productos">
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>

      {/* INFO EMPRESA */}
      <section className="section aboutSection">
        <div className="container">
          <div className="aboutLayout">
            <div className="aboutImageCard">
              <img
                src="/images/experiencia-farquetsa.png"
                alt="Equipo de Laboratorio FARQUETSA en instalaciones de producción"
              />
            </div>

            <div className="aboutContent">
              <div className="kicker">Nosotros</div>
              <h2>¿Quiénes Somos?</h2>
              <div className="aboutCopy">
                <p>
                  Laboratorio FARQUETSA es una empresa guatemalteca fundada en
                  2007 por empresarios con más de 35 años de experiencia en el
                  sector farmacéutico nacional y centroamericano.
                </p>
                <p>
                  FARQUETSA cuenta con amplias instalaciones aprobadas por
                  servicios de salud y cumple con estándares internacionales como
                  las Buenas Prácticas de Manufactura (BPM), manteniéndose a la
                  vanguardia en desarrollo y calidad.
                </p>
              </div>
            </div>
          </div>

          <div className="grid3 aboutCards">
            <div className="cardInfo">
              <div className="cardTop">
                <span className="chip">Misión</span>
              </div>
              <p>
                Trabajamos de manera comprometida para el bienestar de la
                sociedad, promoviendo la salud humana a través de la producción
                de medicamentos de alta calidad, seguridad y confiabilidad.
              </p>
            </div>

            <div className="cardInfo">
              <div className="cardTop">
                <span className="chip">Visión</span>
              </div>
              <p>
                Posicionarnos como uno de los laboratorios más importantes en el
                mercado guatemalteco, reconocidos como una institución innovadora
                y con altos estándares de calidad en nuestros procesos, productos
                y servicio al cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft qualitySection">
        <div className="container">
          <div className="qualityPanel">
            <div className="qualityIntro">
              <div className="kicker">Calidad certificada</div>
              <h2>Buenas Prácticas de Manufactura</h2>
              <p>
                Las Buenas Prácticas de Manufactura (BPM) son un conjunto de
                normas y procedimientos que garantizan que los productos
                farmacéuticos y afines se elaboren bajo condiciones controladas,
                seguras y estandarizadas, asegurando su calidad, eficacia y
                pureza.
              </p>
            </div>

            <div className="qualityBody">
              <p>
                Estas prácticas abarcan todos los aspectos del proceso de
                producción: desde la selección de materias primas, la capacitación
                del personal y la limpieza de las instalaciones, hasta el control
                de procesos y la trazabilidad de cada lote.
              </p>
              <p>
                En Farmacéutica Quetzalteca, S.A., nos enorgullece cumplir con
                una calificación perfecta del 100% en Buenas Prácticas de
                Manufactura, reflejo de nuestro compromiso absoluto con la
                calidad, la seguridad y la excelencia operativa.
              </p>
            </div>

            <div className="qualityStats" aria-label="Indicadores de calidad">
              <div>
                <strong>100%</strong>
                <span>Calificación BPM</span>
              </div>
              <div>
                <strong>Calidad</strong>
                <span>Procesos controlados</span>
              </div>
              <div>
                <strong>Confianza</strong>
                <span>Trazabilidad por lote</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="centerHead">
            <div className="kicker">Novedades</div>
            <h2>Últimas Publicaciones</h2>
            <p>Noticias, consejos y novedades del mundo farmacéutico.</p>
            <PublicacionesCarrusel publicaciones={publicaciones} />
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

    </div>
  );
}
