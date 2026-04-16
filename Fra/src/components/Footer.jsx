export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #e9eef5", marginTop: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 18px", color: "#5c6b7b" }}>
        <strong style={{ color: "#1b2a3a" }}>Rayito Pharmacy</strong>
        <div style={{ marginTop: 6 }}>
          © {new Date().getFullYear()} — Farmacia en Guatemala. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
