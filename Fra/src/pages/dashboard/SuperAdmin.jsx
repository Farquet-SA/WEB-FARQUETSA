

export default function AdminHome() {
  return (
    <div
      style={{
        background: "#c54d4d",
        border: "1px solid #587daa",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 8px 18px rgba(2, 32, 71, 0.06)",
      }}
    >
      <h1 style={{ margin: 0, color: "#0b2b4b" }}>Bienvenido</h1>
      <p style={{ color: "#5c6b7b", marginTop: 8 }}>
        Desde aquí podrás administrar el catálogo: productos, categorías y estados.
      </p>

      <div style={{ marginTop: 12, color: "#20344f" }}>
        Siguiente paso: crear la pantalla <strong>Admin Productos</strong> con CRUD.
      </div>
    </div>
  );
}
