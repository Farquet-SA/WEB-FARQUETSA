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
import "./adminUsuarios.css";

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
    if (clearFeedback) setError("");
  };

  const validate = () => {
    if (!form.username.trim()) return "El nombre de usuario es obligatorio.";
    if (!form.email.trim()) return "El correo electrónico es obligatorio.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) return "El correo electrónico no es válido.";
    if (!editingId && !form.password) return "La contraseña es obligatoria para nuevos usuarios.";
    if (form.password && form.password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  };

  const handleApiError = (err, fallbackMessage) => {
    const status = err?.response?.status;
    if (status === 401) setError("Tu sesión expiró. Vuelve a iniciar sesión.");
    else if (status === 403) setError("No tienes permisos suficientes para realizar esta acción.");
    else setError(fallbackMessage);
  };

  const buildPayload = () => {
    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      is_staff: true,
      is_superuser: form.role === "superadmin",
      is_active: form.is_active,
    };
    if (form.password) payload.password = form.password;
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSaving(true);
    setError("");

    try {
      const payload = buildPayload();
      if (editingId) {
        await updateAdmin(editingId, payload);
        const updatedUsers = await getAdmins();
        setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
        toast.success("Usuario actualizado correctamente.");
      } else {
        await createAdmin(payload);
        const updatedUsers = await getAdmins();
        setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
        toast.success("Usuario creado correctamente.");
      }
      resetForm({ clearFeedback: false });
    } catch (err) {
      handleApiError(err, editingId ? "No se pudo actualizar el usuario." : "No se pudo crear el usuario.");
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
    } catch {
      setForm({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role: user.is_superuser ? "superadmin" : "admin",
        is_active: user.is_active ?? true,
      });
    }
    setError("");
    setShowPassword(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Se eliminará este usuario. ¿Deseas continuar?")) return;
    try {
      await deleteAdmin(id);
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

  const getRoleLabel = (value) =>
    ROLE_OPTIONS.find((item) => item.value === value)?.label || value;

  if (role !== "superadmin") {
    return (
      <div className="auSection">
        <h1 className="auSectionTitle">Acceso denegado</h1>
        <p className="auSectionSub">
          Solo los usuarios con rol <strong>superadmin</strong> pueden acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Formulario */}
      <section className="auSection">
        <div className="auSectionHead">
          <div>
            <h1 className="auSectionTitle">Usuarios</h1>
            <p className="auSectionSub">
              Desde aquí puedes crear, editar y eliminar usuarios administradores.
            </p>
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} className="auCancelBtn">
              Cancelar edición
            </button>
          )}
        </div>

        <form className="auForm" onSubmit={handleSubmit}>
          <div className="auFormRow">
            <input
              className="auInput"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Nombre de usuario *"
              required
            />
            <input
              className="auInput"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Correo electrónico *"
              type="email"
              required
            />
          </div>

          <div className="auFormRow">
            <div className="auPasswordWrap">
              <input
                className="auInput"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={editingId ? "Nueva contraseña (opcional)" : "Contraseña *"}
                type={showPassword ? "text" : "password"}
              />
              <button
                type="button"
                className="auEyeBtn"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <select
              className="auInput"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="auToggleRow">
            <div
              className="auToggleTrack"
              style={{ background: form.is_active ? "#0b2b4b" : "#c9d8ee" }}
              onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
            >
              <div
                className="auToggleThumb"
                style={{ transform: form.is_active ? "translateX(20px)" : "translateX(2px)" }}
              />
            </div>
            <span className="auToggleLabel">
              Usuario {form.is_active ? "activo" : "inactivo"}
            </span>
          </label>

          {error && <div className="auError">{error}</div>}

          <button type="submit" disabled={saving} className="auSubmitBtn">
            {saving ? "Guardando..." : editingId ? "Actualizar usuario" : "Crear usuario"}
          </button>
        </form>
      </section>

      {/* Lista */}
      <section className="auSection noShadow">
        <div className="auListHead">
          <div>
            <h2 className="auSectionTitle">Listado actual</h2>
            <p className="auSectionSub">{`${users.length} usuario(s) registrado(s)`}</p>
          </div>
          {loading && <span style={{ color: "#5c6b7b" }}>Cargando usuarios...</span>}
        </div>

        {users.length === 0 && !loading ? (
          <div className="auEmpty">No hay usuarios creados todavía.</div>
        ) : (
          <div className="auList">
            {users.map((user) => (
              <article key={user.id} className="auRow">
                <div className="auAvatar">{getInitials(user.username)}</div>

                <div className="auUserInfo">
                  <div className="auUserName">{user.username}</div>
                  <div className="auUserEmail">{user.email}</div>
                  <div className="auBadges">
                    <span className="auRolBadge">
                      {getRoleLabel(user.is_superuser ? "superadmin" : "admin")}
                    </span>
                    <span
                      className="auStatusBadge"
                      style={{
                        background: user.is_active ? "#dcfce7" : "#fee2e2",
                        color: user.is_active ? "#166534" : "#b42318",
                      }}
                    >
                      {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="auRowActions">
                  <button type="button" className="auSecBtn" onClick={() => handleEdit(user)}>
                    Editar
                  </button>
                  <button type="button" className="auSecBtn danger" onClick={() => handleDelete(user.id)}>
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
