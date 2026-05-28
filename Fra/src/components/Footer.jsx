import "./footer.css";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "../config/contact";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="siteFooterInner">
        <section className="footerBrandBlock" aria-label="Información de la empresa">
          <img
            className="footerLogo"
            src="/logo-farquetsa.png"
            alt="Farquetsa - Farmacéutica Quetzalteca S.A."
          />
          <div>
            <h2>FARQUETSA</h2>
            <p>Farmacéutica Quetzalteca S.A.</p>
            <span>Distribución farmacéutica y abastecimiento en Guatemala.</span>
          </div>
        </section>

        <section className="footerSection" aria-label="Contacto">
          <h3>Contacto</h3>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href={`tel:${CONTACT_PHONE_TEL}`}>{CONTACT_PHONE_DISPLAY}</a>
        </section>

        <section className="footerSection" aria-label="Enlaces rápidos">
          <h3>Enlaces</h3>
          <a href="/">Inicio</a>
          <a href="/servicios">Servicios</a>
          <a href="/productos">Productos</a>
          <a href="/contacto">Contacto</a>
        </section>

        <section className="footerSection" aria-label="Horario de atención">
          <h3>Horario</h3>
          <p>Lunes a viernes: 8:00 a.m. - 5:00 p.m.</p>
          <p>Sábados: 8:00 a.m. - 12:00 p.m.</p>
          <p>Domingos: cerrado</p>
        </section>
      </div>

      <div className="footerBottom">
        <div className="footerBottomInner">
          <span>© 2026 FARQUETSA. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
