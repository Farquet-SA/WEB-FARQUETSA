import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="wrapper">
      <p className="code">404</p>
      <h1 className="title">Página no encontrada</h1>
      <p className="desc">
        Lo sentimos, la página que buscas no existe o fue movida.
      </p>
      <Link to="/" className="btn">
        Volver al inicio
      </Link>
    </div>
  );
}
