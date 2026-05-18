import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getServicios, getPasos, getConfianza } from "../api/servicios";
import "./servicios.css";
import { Send, BriefcaseBusiness, Lock } from "lucide-react";
import * as LucideIcons from "lucide-react";

export default function ServiciosPage() {
  const [services, setServices] = useState([]);
  const [steps, setSteps] = useState([]);
  const [trust, setTrust] = useState([]);

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
          }
        });
      },
      { threshold: 0.15 },
    );

    nodes.forEach((n) => io.observe(n));

    return () => io.disconnect();
  }, [services, steps, trust]);

  // Cargar datos desde backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const serviciosData = await getServicios();
        const pasosData = await getPasos();
        const confianzaData = await getConfianza();

        setServices(
          Array.isArray(serviciosData)
            ? serviciosData
            : serviciosData.results || [],
        );

        setSteps(
          Array.isArray(pasosData) ? pasosData : pasosData.results || [],
        );

        setTrust(
          Array.isArray(confianzaData)
            ? confianzaData
            : confianzaData.results || [],
        );
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="servicesPage">
      {/* HERO */}
      <section className="servicesHero">
        <div className="techBg" aria-hidden="true">
          <div className="grid" />
          <div className="waves" />
          <div className="glow a" />
          <div className="glow b" />
        </div>

        <div className="container heroInner">
          <div className="pill reveal from-left">
            FARQUETSA • Mayoreo • Retail • Asesoría
          </div>

          <h1 className="reveal from-left">
            Servicios farmacéuticos <span>profesionales</span>
          </h1>

          <p className="heroText reveal from-left">
            Soluciones confiables para farmacias, clínicas, negocios y clientes
            individuales en Guatemala. Cotiza rápido con atención cercana.
          </p>

          <div className="heroActions reveal from-left">
            <Link className="btnPrimary" to="/contacto">
              Solicitar cotización
            </Link>

            <Link className="btnGhost" to="/productos">
              Ver catálogo
            </Link>
          </div>

          <div className="heroStats reveal from-up">
            <div className="statCard">
              <strong>20+</strong>
              <span>años de experiencia</span>
            </div>

            <div className="statCard">
              <strong>Catálogo</strong>
              <span>actualizado por estado</span>
            </div>

            <div className="statCard">
              <strong>Atención</strong>
              <span>personalizada y responsable</span>
            </div>

            <div className="statCard">
              <strong>Envíos</strong>
              <span>según zona y disponibilidad</span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <div>
              <div className="kicker reveal from-left">SERVICIOS</div>
              <h2 className="reveal from-left">Nuestros Servicios</h2>
              <p className="muted reveal from-left">
                Soluciones pensadas para rapidez, claridad en cotizaciones y
                disponibilidad real.
              </p>
            </div>
          </div>

          <div className="servicesGrid">
            {services.map((s, i) => (
              <article
                key={s.id}
                className={`serviceCard reveal ${
                  i % 2 === 0 ? "from-left" : "from-right"
                }`}
                style={{ transitionDelay: `${(i % 6) * 60}ms` }}
              >
                <div className="serviceIcon" aria-hidden="true">
                  {(() => {
                    const IconComp = LucideIcons[s.icon];
                    return IconComp ? (
                      <IconComp size={24} />
                    ) : (
                      <span>{s.icon}</span>
                    );
                  })()}
                </div>

                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="section soft">
        <div className="container">
          <div className="sectionHead">
            <div>
              <div className="kicker reveal from-left">PROCESO</div>
              <h2 className="reveal from-left">Cómo trabajamos</h2>
              <p className="muted reveal from-left">
                Un flujo simple para cotizar sin complicaciones.
              </p>
            </div>
          </div>

          <div className="processGrid">
            {steps.map((st, i) => (
              <div
                key={st.id}
                className="processStep reveal from-up"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="stepBadge">
                  {(() => {
                    const IconComp = LucideIcons[st.numero];
                    return IconComp ? (
                      <IconComp size={24} />
                    ) : (
                      <span>{st.numero}</span>
                    );
                  })()}
                </div>{" "}
                <h4>{st.title}</h4>
                <p>{st.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIANZA */}
      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <div>
              <div className="kicker reveal from-left">CONFIANZA</div>
              <h2 className="reveal from-left">Compromiso y confianza</h2>
              <p className="muted reveal from-left">
                Nuestro enfoque es calidad, transparencia y seguimiento real.
              </p>
            </div>
          </div>

          <div className="trustGrid">
            {trust.map((t, i) => (
              <div
                key={t.id}
                className={`trustCard reveal ${
                  i === 1 ? "from-up" : i === 0 ? "from-left" : "from-right"
                }`}
              >
                <div className="trustIcon">
                  {(() => {
                    const IconComp = LucideIcons[t.icon];
                    return IconComp ? (
                      <IconComp size={24} />
                    ) : (
                      <span>{t.icon}</span>
                    );
                  })()}
                </div>
                <strong>{t.title}</strong>
                <p>{t.text}</p>
              </div>
            ))}
          </div>

          <div className="ctaPanel reveal from-up">
            <div>
              <div className="ctaKicker">¿LISTO PARA COTIZAR?</div>
              <div className="ctaTitle">
                Te ayudamos a encontrar lo que necesitas
              </div>
              <p className="ctaText">
                Para cotizaciones, abastecimiento o información adicional,
                comunícate con nuestro equipo.
              </p>
            </div>

            <Link className="btnPrimary" to="/contacto">
              Ir a Contacto
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
