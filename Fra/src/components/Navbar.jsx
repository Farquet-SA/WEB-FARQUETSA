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
            <span>Farmacéutica S.A</span>
          </div>
        </div>

        <nav className={`navLinks${menuOpen ? " open" : ""}`} aria-label="Navegación principal">
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
          <button className="cartBtn" type="button" onClick={open} aria-label="Abrir carrito">
            <svg
              className="cartIcon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6.5 7.5h14l-1.4 7.1a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.7L5.8 4.8H3.5"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 20a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4ZM17.2 20a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4Z"
                fill="currentColor"
              />
            </svg>
            {count > 0 && <span className="cartBadge">{count}</span>}
          </button>

          <a className="callBtn" href="tel:+50200000000">
            Llamar ahora
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
