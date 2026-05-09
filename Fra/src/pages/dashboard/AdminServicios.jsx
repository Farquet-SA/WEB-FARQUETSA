import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
  getPublicaciones,
  createPublicacion,
  updatePublicacion,
  deletePublicacion,
  uploadProductImage,
} from "../../api/servicios";

const EMPTY_FORM = {
  icon: "",
  title: "",
  text: "",
  section: "servicios",
  image: null,
};

export default function AdminServicios() {
  const [services, setServices] = useState([]);
  const [steps, setSteps] = useState([]);
  const [trust, setTrust] = useState([]);
  const [publications, setPublications] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
  if (!(form.image instanceof File)) return;
  const url = URL.createObjectURL(form.image);
  // no uses createObjectURL directo en el src, usa este estado
  return () => URL.revokeObjectURL(url);
}, [form.image]);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const serviciosData = await getServicios();
      const pasosData = await getPasos();
      const confianzaData = await getConfianza();
      const publicationsData = await getPublicaciones();

      setServices(Array.isArray(serviciosData) ? serviciosData : []);
      setSteps(Array.isArray(pasosData) ? pasosData : []);
      setTrust(Array.isArray(confianzaData) ? confianzaData : []);
      setPublications(Array.isArray(publicationsData) ? publicationsData : []);
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
      
      let imageUrl = form.image;
      if (imageUrl instanceof File) {
        imageUrl = await uploadProductImage(form.image); 
      }

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

      if (form.section === "publicaciones") {
        const pubPayload = {
          icon: form.icon.trim(),
          title: form.title.trim(),
          text: form.text.trim(),
          image: imageUrl || "",
        };
        if (editingId) {
          await updatePublicacion(editingId, pubPayload);
          toast.success("Publicación actualizada.");
        } else {
          await createPublicacion(pubPayload);
          toast.success("Publicación creada.");
        }
      }

      await loadData();
      resetForm();
    } catch {
      toast.error("Ocurrió un error al guardar, revise lo ingresado e intente nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item, section) => {
    setEditingId(item.id);

    setForm({
      icon: item.icon || item.numero || "",
      title: item.title || "",
      text: item.text || "",
      section,
      image: item.image || null, 
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
      if (section === "publicaciones") {
        await deletePublicacion(id);
      }

      await loadData();
      toast.success("Registro eliminado.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
  };

  const renderSection = (title, data, sectionName) => (
    <section style={{ ...sectionStyle, boxShadow: "none" }}>
      <h2 style={{ margin: 0, color: "#0b2b4b" }}>{title}</h2>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {data.map((item) => (
          <article key={item.id} style={rowStyle}>

            {sectionName === "publicaciones" && (<img 
                  src={
                    item.image || "https://via.placeholder.com/92?text=Img"
                  }
                  
                  style={{
                    width: 92,
                    height: 92,
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />)}
            <div style={iconCircleStyle}>
              {item.icon || item.numero || "🩺"}
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
                image: null,
              }))
            }
            style={inputStyle}
          >
            <option value="servicios">Nuestros Servicios</option>
            <option value="pasos">Cómo trabajamos</option>
            <option value="confianza">Compromiso y confianza</option>
            <option value="publicaciones">Publicaciónes</option>
          </select>

          <input
            value={form.icon}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                icon: e.target.value,
              }))
            }
            placeholder="Emoji *"
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
            placeholder="Título *"
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
            placeholder="Descripción *"
            style={inputStyle}
          />

          {form.section === "publicaciones" && (
            <div
              style={{
                border: "1px dashed #c9d8ee",
                borderRadius: 14,
                padding: 14,
                display: "grid",
                gap: 12,
                alignItems: "start",
              }}
            >
              <label style={{ color: "#20344f", fontWeight: 700 }}>
              Imagen del producto
              </label>
              <p>De preferencia, la imagen en formato horizontal</p>
              <input
                type="file"
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0]; 
                  if (file) {
                    setForm((prev) => ({
                      ...prev,
                      image: file,
                    }));
                  }
                }}
                style={inputStyle}
              />
              
              {form.image && (
                <div style={{ marginTop: 10 }}>
                  <img 
                    src={form.image instanceof File
                        ? URL.createObjectURL(form.image)  
                        : form.image                       
                    }
                    alt="Preview"
                    style={{
                      width: 160,
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 14,
                      border: "1px solid #e5edf7",
                    }}
                  />
                </div>
              )}
              
              
            </div>
          )}

          <button type="submit" style={submitBtnStyle}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </section>

      {renderSection("Nuestros Servicios", services, "servicios")}
      {renderSection("Cómo trabajamos", steps, "pasos")}
      {renderSection("Compromiso y confianza", trust, "confianza")}
      {renderSection("Publicaciónes", publications, "publicaciones")}
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
