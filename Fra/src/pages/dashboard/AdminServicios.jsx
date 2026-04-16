import { useCallback, useEffect, useState } from "react";
import {
  getServicios,
  createServicio,
  updateServicio,
  deleteServicio,
  getPasos,
  createPaso,
  updatePaso,
  deletePaso,
  getConfianza,
  createConfianza,
  updateConfianza,
  deleteConfianza,
} from "../../api/servicios";

const EMPTY_FORM = {
  icon: "",
  title: "",
  text: "",
  section: "servicios",
};

export default function AdminServicios() {
  const [services, setServices] = useState([]);
  const [steps, setSteps] = useState([]);
  const [trust, setTrust] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const serviciosData = await getServicios();
      const pasosData = await getPasos();
      const confianzaData = await getConfianza();

      setServices(Array.isArray(serviciosData) ? serviciosData : []);
      setSteps(Array.isArray(pasosData) ? pasosData : []);
      setTrust(Array.isArray(confianzaData) ? confianzaData : []);
    } catch {
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  };

  const validate = () => {
    if (!form.title.trim()) return "El título es obligatorio.";
    if (!form.text.trim()) return "La descripción es obligatoria.";
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
    setSuccess("");

    try {
      const payload = {
        icon: form.icon.trim(),
        title: form.title.trim(),
        text: form.text.trim(),
      };

      if (form.section === "servicios") {
        if (editingId) {
          await updateServicio(editingId, payload);
          setSuccess("Servicio actualizado.");
        } else {
          await createServicio(payload);
          setSuccess("Servicio creado.");
        }
      }

      if (form.section === "pasos") {
        const pasoPayload = {
          numero: form.icon.trim(), 
          title: form.title.trim(),
          text: form.text.trim(),
        };

        if (editingId) {
          await updatePaso(editingId, pasoPayload);
          setSuccess("Paso actualizado.");
        } else {
          await createPaso(pasoPayload);
          setSuccess("Paso creado.");
        }
      }

      if (form.section === "confianza") {
        if (editingId) {
          await updateConfianza(editingId, payload);
          setSuccess("Elemento actualizado.");
        } else {
          await createConfianza(payload);
          setSuccess("Elemento creado.");
        }
      }

      await loadData();
      resetForm();
    } catch {
      setError("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item, section) => {
    setEditingId(item.id);

    setForm({
      icon: item.icon || "",
      title: item.title || "",
      text: item.text || "",
      section,
    });

    setError("");
    setSuccess("");
  };

  const handleDelete = async (id, section) => {
    const ok = window.confirm("¿Deseas eliminar este registro?");
    if (!ok) return;

    try {
      if (section === "servicios") {
        await deleteServicio(id);
      }

      if (section === "pasos") {
        await deletePaso(id);
      }

      if (section === "confianza") {
        await deleteConfianza(id);
      }

      await loadData();
      setSuccess("Registro eliminado.");
    } catch {
      setError("No se pudo eliminar.");
    }
  };

  const renderSection = (title, data, sectionName) => (
    <section style={{ ...sectionStyle, boxShadow: "none" }}>
      <h2 style={{ margin: 0, color: "#0b2b4b" }}>{title}</h2>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {data.map((item) => (
          <article key={item.id} style={rowStyle}>
            <div style={iconCircleStyle}>
              {item.icon || "🩺"}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, color: "#0b2b4b" }}>
                {item.title}
              </div>

              <div
                style={{
                  color: "#5c6b7b",
                  marginTop: 3,
                  fontSize: 14,
                }}
              >
                {item.text}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleEdit(item, sectionName)}
                style={secondaryBtnStyle}
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(item.id, sectionName)}
                style={{
                  ...secondaryBtnStyle,
                  color: "#b42318",
                }}
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={sectionStyle}>
        <h1 style={{ margin: 0, color: "#0b2b4b" }}>
          Administrar contenido
        </h1>

        {loading && (
          <p style={{ color: "#5c6b7b", margin: "10px 0 0" }}>
            Cargando contenido...
          </p>
        )}
        {error && (
          <p style={{ color: "#b42318", margin: "10px 0 0", fontWeight: 700 }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: "#166534", margin: "10px 0 0", fontWeight: 700 }}>
            {success}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 14, marginTop: 18 }}
        >
          <select
            value={form.section}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                section: e.target.value,
              }))
            }
            style={inputStyle}
          >
            <option value="servicios">Nuestros Servicios</option>
            <option value="pasos">Cómo trabajamos</option>
            <option value="confianza">Compromiso y confianza</option>
          </select>

          <input
            value={form.icon}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                icon: e.target.value,
              }))
            }
            placeholder="Emoji"
            style={inputStyle}
          />

          <input
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            placeholder="Título"
            style={inputStyle}
          />

          <textarea
            rows={4}
            value={form.text}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                text: e.target.value,
              }))
            }
            placeholder="Descripción"
            style={inputStyle}
          />

          <button type="submit" style={submitBtnStyle}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </section>

      {renderSection("Nuestros Servicios", services, "servicios")}
      {renderSection("Cómo trabajamos", steps, "pasos")}
      {renderSection("Compromiso y confianza", trust, "confianza")}
    </div>
  );
}

const sectionStyle = {
  background: "#fff",
  border: "1px solid #e5edf7",
  borderRadius: 18,
  padding: 18,
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

const secondaryBtnStyle = {
  height: 38,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #dbe7f7",
  background: "#fff",
  fontWeight: 800,
  cursor: "pointer",
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
};
