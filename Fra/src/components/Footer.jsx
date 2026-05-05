import "./footer.css";

const team = [
  "Guzmán Cristian",
  "Hernández Anderson",
  "Laines Karen",
  "Sanic Camilo",
  "López Karla",
  "Monzón Andy",
  "Ovalle Luis",
  "Vásquez Brandon",
];

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="siteFooterInner">
        <section className="footerBrandBlock" aria-label="Información de la empresa">
          <img
            className="footerLogo"
            src="/logo-farquetsa.png"
            alt="Logo de Farquetsa"
          />
          <div>
            <h2>FARQUETSA</h2>
            <p>Farmacéutica Quetzalteca S.A.</p>
          </div>
        </section>

        <section className="footerSection" aria-label="Contacto">
          <h3>Contacto</h3>
          <a href="mailto:informacion@farquetsa.com">informacion@farquetsa.com</a>
          <a href="tel:+50277616479">+502 7761 6479</a>
        </section>

        <section className="footerSection footerTeam" aria-label="Nombres del equipo">
          <div className="footerTeamGrid">
            {team.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
          <p className="footerUniversity">Universidad Rafael Landívar</p>
        </section>
      </div>

      <div className="footerBottom">
        <div className="footerBottomInner">
          <span>© 2026 — Farmacia en Guatemala. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
