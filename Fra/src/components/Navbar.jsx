import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./navbar.css";

export default function Navbar() {
  const { open, count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navWrap">
      <div className="navInner">
        <div className="brand">
          <img
            className="brandLogo"
            src="/logo-farquetsa.png"
            alt="Logo de Farquetsa"
          />
          <div className="brandText">
            <strong>Farquetsa</strong>
            <span>Farmaceutica S.A</span>
          </div>
        </div>

        <nav className={`navLinks${menuOpen ? " open" : ""}`}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
            Inicio
          </NavLink>
          <NavLink to="/servicios" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
            Servicios
          </NavLink>
          <NavLink to="/productos" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
            Productos
          </NavLink>
          <NavLink to="/contacto" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
            Contacto
          </NavLink>
        </nav>

        <div className="navActions">
          <button className="cartBtn" type="button" onClick={open}>
            <span className="cartIcon" aria-hidden="true">🛒</span>
            {count > 0 && <span className="cartBadge">{count}</span>}
          </button>

          <a className="callBtn" href="tel:+50200000000">
            Llamar Ahora
          </a>

          <button
            className="hamburger"
            type="button"
            aria-label="Menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={menuOpen ? "ham-line open" : "ham-line"} />
            <span className={menuOpen ? "ham-line open" : "ham-line"} />
            <span className={menuOpen ? "ham-line open" : "ham-line"} />
          </button>
        </div>
      </div>
    </header>
  );
}
