import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Pagination from "../../components/Pagination";
import StatusBlock from "../../components/StatusBlock";
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
const PAGE_SIZE = 10;

export default function AdminServicios() {
  const [services, setServices] = useState([]);
  const [steps, setSteps] = useState([]);
  const [trust, setTrust] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [pages, setPages] = useState({
    servicios: 1,
    pasos: 1,
    confianza: 1,
  });

  const paginate = useCallback((data, sectionName) => {
    const page = pages[sectionName] ?? 1;
    const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [pages]);

  const paginatedServices = useMemo(
    () => paginate(services, "servicios"),
    [services, paginate],
  );
  const paginatedSteps = useMemo(
    () => paginate(steps, "pasos"),
    [steps, paginate],
  );
  const paginatedTrust = useMemo(
    () => paginate(trust, "confianza"),
    [trust, paginate],
  );

  const setSectionPage = (sectionName, page) => {
    setPages((prev) => ({ ...prev, [sectionName]: page }));
  };

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
      toast.error("No se pudieron cargar los datos.");
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
    // success messages handled by toast
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

    try {
      const payload = {
        icon: form.icon.trim(),
        title: form.title.trim(),
        text: form.text.trim(),
      };

      if (form.section === "servicios") {
        if (editingId) {
          await updateServicio(editingId, payload);
          toast.success("Servicio actualizado.");
        } else {
          await createServicio(payload);
          toast.success("Servicio creado.");
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
          toast.success("Paso actualizado.");
        } else {
          await createPaso(pasoPayload);
          toast.success("Paso creado.");
        }
      }

      if (form.section === "confianza") {
        if (editingId) {
          await updateConfianza(editingId, payload);
          toast.success("Elemento actualizado.");
        } else {
          await createConfianza(payload);
          toast.success("Elemento creado.");
        }
      }

      await loadData();
      resetForm();
    } catch {
      toast.error("Ocurrió un error al guardar.");
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
      toast.success("Registro eliminado.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
  };

  const renderSection = (title, data, paginatedData, sectionName) => (
    <section style={{ ...sectionStyle, boxShadow: "none" }}>
      <h2 style={{ margin: 0, color: "#0b2b4b" }}>{title}</h2>

      {data.length === 0 ? (
        <StatusBlock
          title="Sin registros"
          message="Agrega contenido para que esta sección se vea completa en el sitio público."
          icon="0"
        />
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {paginatedData.map((item) => (
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
                type="button"
                onClick={() => handleEdit(item, sectionName)}
                style={secondaryBtnStyle}
              >
                Editar
              </button>

              <button
                type="button"
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
      )}
      {data.length > 0 && (
        <Pagination
          page={pages[sectionName] ?? 1}
          totalItems={data.length}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setSectionPage(sectionName, page)}
          itemLabel="registros"
        />
      )}
    </section>
  );

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={sectionStyle}>
        <h1 style={{ margin: 0, color: "#0b2b4b" }}>
          Administrar contenido
        </h1>

        {loading && (
          <StatusBlock
            title="Cargando contenido"
            message="Estamos consultando servicios, pasos y elementos de confianza."
            tone="loading"
            icon="..."
          />
        )}
        {error && (
          <StatusBlock title="Revisa el contenido" message={error} tone="error" icon="!" />
        )}

        <form
          onSubmit={handleSubmit}
          className="adminFormGrid"
        >
          <label className="adminField" htmlFor="contenido-seccion">
            <span>Sección</span>
          <select
            id="contenido-seccion"
            className="adminInput"
            value={form.section}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                section: e.target.value,
              }))
            }
          >
            <option value="servicios">Nuestros Servicios</option>
            <option value="pasos">Cómo trabajamos</option>
            <option value="confianza">Compromiso y confianza</option>
          </select>
          </label>

          <div className="adminFieldGrid">
            <label className="adminField" htmlFor="contenido-icono">
              <span>Icono o número</span>
              <input
                id="contenido-icono"
                className="adminInput"
                value={form.icon}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    icon: e.target.value,
                  }))
                }
                placeholder="Ej. 1, ayuda, envío"
              />
            </label>

            <label className="adminField" htmlFor="contenido-titulo">
              <span>Título</span>
              <input
                id="contenido-titulo"
                className="adminInput"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Título visible"
              />
            </label>
          </div>

          <label className="adminField" htmlFor="contenido-descripcion">
            <span>Descripción</span>
            <textarea
              id="contenido-descripcion"
              className="adminInput"
              rows={4}
              value={form.text}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  text: e.target.value,
                }))
              }
              placeholder="Descripción visible en el sitio"
            />
          </label>

          <button type="submit" style={submitBtnStyle}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </section>

      {renderSection("Nuestros Servicios", services, paginatedServices, "servicios")}
      {renderSection("Cómo trabajamos", steps, paginatedSteps, "pasos")}
      {renderSection("Compromiso y confianza", trust, paginatedTrust, "confianza")}
    </div>
  );
}

const sectionStyle = {
  background: "#fff",
  border: "1px solid #e5edf7",
  borderRadius: 18,
  padding: 18,
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
