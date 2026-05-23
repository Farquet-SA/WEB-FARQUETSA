import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CONTACT_PHONE_TEL } from "../config/contact";
import "./navbar.css";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { open, count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navWrap">
      <div className="navInner">
        <Link
          className="brand"
          to="/"
          aria-label="Ir al inicio"
          onClick={() => setMenuOpen(false)}
        >
          <img
            className="brandLogo"
            src="/logo-farquetsa-header.png"
            alt="Farquetsa - Farmacéutica Quetzalteca S.A."
          />
          <div className="brandText">
            <strong>Farquetsa</strong>
            <span>Farmacéutica Quetzalteca S.A</span>
          </div>
        </Link>

        <nav className={`navLinks${menuOpen ? " open" : ""}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/servicios"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Servicios
          </NavLink>
          <NavLink
            to="/productos"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Productos
          </NavLink>
          <NavLink
            to="/contacto"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Contacto
          </NavLink>
        </nav>

        <div className="navActions">
          <button className="cartBtn" type="button" onClick={open}>
            <span className="cartIcon" aria-hidden="true">
              <ShoppingCart size={20} />
            </span>
            {count > 0 && <span className="cartBadge">{count}</span>}
          </button>

          <a className="callBtn" href={`tel:${CONTACT_PHONE_TEL}`}>
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
