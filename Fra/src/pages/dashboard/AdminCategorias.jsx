import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../api/categories";

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
};

export default function AdminCategorias() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nextId = useRef(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  };

  const validate = () => {
    if (!form.nombre.trim()) return "El nombre de la categoría es obligatorio.";
    if (form.nombre.trim().length < 2) return "El nombre debe tener al menos 2 caracteres.";
    const duplicate = categories.find(
      (c) => c.nombre.toLowerCase() === form.nombre.trim().toLowerCase() && c.id !== editingId
    );
    if (duplicate) return "Ya existe una categoría con ese nombre.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    if (editingId) await updateCategory(editingId, { nombre: form.nombre.trim(), descripcion: form.descripcion.trim() });
    else await createCategory({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim() });

    await loadData();
    await new Promise((r) => setTimeout(r, 300));

    if (editingId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId ? { ...c, nombre: form.nombre.trim(), descripcion: form.descripcion.trim() } : c
        )
      );
      toast.success("Categoría actualizada.");
    } else {
      const newCat = {
        id: nextId.current++,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
      };
      setCategories((prev) => [...prev, newCat]);
      toast.success("Categoría creada.");
    }

    setSaving(false);
    resetForm();
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ nombre: cat.nombre || "", descripcion: cat.descripcion || "" });
    setError("");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Se eliminará esta categoría. ¿Deseas continuar?");
    if (!ok) return;

    try {
      await deleteCategory(id);
      await loadData();
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) resetForm();
      toast.success("Categoría eliminada.");
    } catch {
      toast.error("No se pudo eliminar la categoría.");
    }
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* ── Formulario ─────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, color: "#0b2b4b" }}>Categorías</h1>
            <p style={{ color: "#5c6b7b", margin: "8px 0 0" }}>
              Crea, edita y elimina las categorías de productos.
            </p>
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} style={cancelBtnStyle}>
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 18 }}>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <input
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre de la categoría *"
              required
              style={inputStyle}
            />
            <input
              value={form.descripcion}
              onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción (opcional)"
              style={inputStyle}
            />
          </div>

          {error && <div style={{ color: "#b42318", fontWeight: 700 }}>{error}</div>}

          <button type="submit" disabled={saving} style={submitBtnStyle}>
            {saving ? "Guardando..." : editingId ? "Actualizar categoría" : "Crear categoría"}
          </button>
        </form>
      </section>

      {/* ── Listado ────────────────────────────────────────────────── */}
      <section style={{ ...sectionStyle, boxShadow: "none" }}>
        <h2 style={{ margin: 0, color: "#0b2b4b" }}>Listado actual</h2>
        <p style={{ color: "#5c6b7b", marginTop: 8 }}>
          {loading ? "Cargando..." : `${categories.length} categoría(s) registradas`}
        </p>

        {loading ? (
          <div style={emptyBoxStyle}>Cargando categorías...</div>
        ) : categories.length === 0 ? (
          <div style={emptyBoxStyle}>No hay categorías creadas todavía.</div>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {categories.map((cat) => (
              <article key={cat.id} style={rowStyle}>
                <div style={iconCircleStyle}>
                  {cat.nombre.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, color: "#0b2b4b" }}>{cat.nombre}</div>
                  {cat.descripcion && (
                    <div style={{ color: "#5c6b7b", marginTop: 3, fontSize: 14 }}>
                      {cat.descripcion}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button type="button" onClick={() => handleEdit(cat)} style={secondaryBtnStyle}>
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    style={{ ...secondaryBtnStyle, color: "#b42318" }}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────
const sectionStyle = {
  background: "#fff",
  border: "1px solid #e5edf7",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 8px 18px rgba(2, 32, 71, 0.06)",
};

const inputStyle = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e5edf7",
  font: "inherit",
};

const submitBtnStyle = {
  height: 44,
  borderRadius: 12,
  border: "1px solid #dbe7f7",
  background: "#0b2b4b",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const cancelBtnStyle = {
  height: 42,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid #dbe7f7",
  background: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  color: "#0b2b4b",
};

const secondaryBtnStyle = {
  height: 38,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #dbe7f7",
  background: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  color: "#0b2b4b",
};

const emptyBoxStyle = {
  marginTop: 14,
  borderRadius: 14,
  border: "1px dashed #c9d8ee",
  padding: 16,
  color: "#5c6b7b",
};

const rowStyle = {
  border: "1px solid #e5edf7",
  borderRadius: 16,
  padding: "12px 14px",
  display: "flex",
  gap: 14,
  alignItems: "center",
};

const iconCircleStyle = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "#eef4fc",
  color: "#0b2b4b",
  fontWeight: 900,
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
