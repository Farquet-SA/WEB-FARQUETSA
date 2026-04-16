// AdminUsuarios.jsx
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getRole } from "../../api/auth";
import {
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../api/admin";

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "superadmin", label: "Superadmin" },
];

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  role: "admin",
  is_active: true,
};

export default function AdminUsuarios() {
  const role = getRole();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = useCallback(async () => {
    if (role !== "superadmin") {
      setError("Solo superadmin puede gestionar usuarios.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getAdmins();
      setUsers(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setUsers([]);
      handleApiError(err, "Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetForm = ({ clearFeedback = true } = {}) => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowPassword(false);
    if (clearFeedback) {
      setError("");
    }
  };

  const validate = () => {
    if (!form.username.trim()) return "El nombre de usuario es obligatorio.";
    if (!form.email.trim()) return "El correo electrónico es obligatorio.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim()))
      return "El correo electrónico no es válido.";
    if (!editingId && !form.password)
      return "La contraseña es obligatoria para nuevos usuarios.";
    if (form.password && form.password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  };

  const handleApiError = (err, fallbackMessage) => {
    const status = err?.response?.status;
    if (status === 401) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión.");
    } else if (status === 403) {
      setError("No tienes permisos suficientes para realizar esta acción.");
    } else {
      setError(fallbackMessage);
    }
  };

  const buildPayload = () => {
    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      is_staff: true,
      is_superuser: form.role === "superadmin",
      is_active: form.is_active,
    };

    if (form.password) {
      payload.password = form.password;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = buildPayload();

      if (editingId) {
        await updateAdmin(editingId, payload);
        // Recargar la lista completa para asegurar consistencia
        const updatedUsers = await getAdmins();
        setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
        toast.success("Usuario actualizado correctamente.");
      } else {
        await createAdmin(payload);
        // Recargar la lista completa
        const updatedUsers = await getAdmins();
        setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
        toast.success("Usuario creado correctamente.");
      }

      resetForm({ clearFeedback: false });
    } catch (err) {
      handleApiError(
        err,
        editingId
          ? "No se pudo actualizar el usuario."
          : "No se pudo crear el usuario.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (user) => {
    setEditingId(user.id);
    try {
      const fullUser = await getAdmin(user.id);
      setForm({
        username: fullUser.username || "",
        email: fullUser.email || "",
        password: "",
        role: fullUser.is_superuser ? "superadmin" : "admin",
        is_active: fullUser.is_active ?? true,
      });
    } catch (err) {
      // Si falla obtener el detalle, usar los datos de la lista
      setForm({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role: user.is_superuser ? "superadmin" : "admin",
        is_active: user.is_active ?? true,
      });
      console.error("Error obteniendo detalle del usuario:", err);
    }
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Se eliminará este usuario. ¿Deseas continuar?");
    if (!ok) return;

    try {
      await deleteAdmin(id);
      // Recargar la lista completa para asegurar consistencia
      const updatedUsers = await getAdmins();
      setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
      toast.success("Usuario eliminado correctamente.");
      setError("");
      if (editingId === id) resetForm();
    } catch (err) {
      handleApiError(err, "No se pudo eliminar el usuario.");
    }
  };

  const getInitials = (username = "") => {
    const parts = username.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return username.charAt(0).toUpperCase();
  };

  const getRoleLabel = (value) => {
    return ROLE_OPTIONS.find((item) => item.value === value)?.label || value;
  };

  if (role !== "superadmin") {
    return (
      <div style={sectionStyle}>
        <h1 style={{ margin: 0, color: "#0b2b4b" }}>Acceso denegado</h1>
        <p style={{ color: "#5c6b7b", marginTop: 10 }}>
          Solo los usuarios con rol <strong>superadmin</strong> pueden acceder a
          esta sección.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: "#0b2b4b" }}>Usuarios</h1>
            <p style={{ color: "#5c6b7b", margin: "8px 0 0" }}>
              Desde aquí puedes crear, editar y eliminar usuarios
              administradores.
            </p>
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} style={cancelBtnStyle}>
              Cancelar edición
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 14, marginTop: 18 }}
        >
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <input
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Nombre de usuario *"
              required
              style={inputStyle}
            />
            <input
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Correo electrónico *"
              type="email"
              required
              style={inputStyle}
            />
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <div style={{ position: "relative" }}>
              <input
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder={
                  editingId ? "Nueva contraseña (opcional)" : "Contraseña *"
                }
                type={showPassword ? "text" : "password"}
                style={{
                  ...inputStyle,
                  width: "100%",
                  boxSizing: "border-box",
                  paddingRight: 44,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={eyeBtnStyle}
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, role: e.target.value }))
              }
              style={inputStyle}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label style={toggleRowStyle}>
            <div
              onClick={() =>
                setForm((prev) => ({ ...prev, is_active: !prev.is_active }))
              }
              style={{
                ...toggleTrackStyle,
                background: form.is_active ? "#0b2b4b" : "#c9d8ee",
              }}
            >
              <div
                style={{
                  ...toggleThumbStyle,
                  transform: form.is_active
                    ? "translateX(20px)"
                    : "translateX(2px)",
                }}
              />
            </div>
            <span style={{ color: "#20344f", fontWeight: 700, fontSize: 14 }}>
              Usuario {form.is_active ? "activo" : "inactivo"}
            </span>
          </label>

          {error && (
            <div style={{ color: "#b42318", fontWeight: 700 }}>{error}</div>
          )}

          <button type="submit" disabled={saving} style={submitBtnStyle}>
            {saving
              ? "Guardando..."
              : editingId
                ? "Actualizar usuario"
                : "Crear usuario"}
          </button>
        </form>
      </section>

      <section style={{ ...sectionStyle, boxShadow: "none" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#0b2b4b" }}>Listado actual</h2>
            <p
              style={{ color: "#5c6b7b", marginTop: 8 }}
            >{`${users.length} usuario(s) registrado(s)`}</p>
          </div>
          {loading && (
            <span style={{ color: "#5c6b7b" }}>Cargando usuarios...</span>
          )}
        </div>

        {users.length === 0 && !loading ? (
          <div style={emptyBoxStyle}>No hay usuarios creados todavía.</div>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {users.map((user) => (
              <article key={user.id} style={rowStyle}>
                <div style={avatarStyle}>{getInitials(user.username)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, color: "#0b2b4b" }}>
                    {user.username}
                  </div>
                  <div style={{ color: "#5c6b7b", fontSize: 14, marginTop: 2 }}>
                    {user.email}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={rolBadgeStyle}>
                      {getRoleLabel(user.is_superuser ? "superadmin" : "admin")}
                    </span>
                    <span
                      style={{
                        ...statusBadgeStyle,
                        background: user.is_active ? "#dcfce7" : "#fee2e2",
                        color: user.is_active ? "#166534" : "#b42318",
                      }}
                    >
                      {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(user)}
                    style={secondaryBtnStyle}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
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
  flexWrap: "wrap",
};

const avatarStyle = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "#eef4fc",
  color: "#0b2b4b",
  fontWeight: 900,
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  letterSpacing: 1,
};

const rolBadgeStyle = {
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 8,
  background: "#eef4fc",
  color: "#0b2b4b",
  fontWeight: 700,
  fontSize: 12,
  border: "1px solid #dbe7f7",
};

const statusBadgeStyle = {
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 12,
};

const eyeBtnStyle = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  padding: 2,
};

const toggleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
  userSelect: "none",
  width: "fit-content",
};

const toggleTrackStyle = {
  width: 44,
  height: 24,
  borderRadius: 12,
  cursor: "pointer",
  position: "relative",
  transition: "background 0.2s",
  flexShrink: 0,
};

const toggleThumbStyle = {
  position: "absolute",
  top: 2,
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#fff",
  transition: "transform 0.2s",
  boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
};
