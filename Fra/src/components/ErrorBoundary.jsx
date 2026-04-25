import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error de interfaz:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <h1>No pudimos cargar esta vista</h1>
            <p className="muted">
              Actualiza la página o vuelve al inicio para continuar.
            </p>
            <a className="btnPrimary" href="/">
              Volver al inicio
            </a>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
