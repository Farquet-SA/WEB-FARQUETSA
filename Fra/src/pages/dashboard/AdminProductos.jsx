import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Pagination from "../../components/Pagination";
import StatusBlock from "../../components/StatusBlock";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  uploadProductImage,
  updateProduct,
} from "../../api/products";

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "",
  estado: "disponible",
  formula: "",
  registro: "",
  presentacion: "",
};
const PAGE_SIZE = 10;

export default function AdminProductos() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: getProducts,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategories,
  });

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const categoryMap = useMemo(
    () => new Map(categories.map((item) => [String(item.id), item.nombre])),
    [categories],
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setPreview("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const buildPayload = () => {
    const currentFile = fileInputRef.current?.files?.[0] || null;
    const hasSelectedFile = !!(currentFile && currentFile.size > 0);
    const current = editingId
      ? products.find((item) => item.id === editingId)
      : null;

    return {
      currentFile,
      hasSelectedFile,
      payload: {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: form.precio || "0",
        estado: form.estado,
        categoria: form.categoria || null,
        imagen: current?.imagen || "",
        formula: form.formula.trim(),
        registro: form.registro.trim(),
        presentacion: form.presentacion.trim(),
      },
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { payload, hasSelectedFile, currentFile } = buildPayload();
    const precioNum = parseFloat(payload.precio);

    if (!editingId && !hasSelectedFile) {
      setError("Debes seleccionar una imagen antes de crear el producto.");
      return;
    }

    if (isNaN(precioNum) || precioNum <= 0) {
      setError("El precio debe ser mayor a Q0.00.");
      return;
    }
    if (precioNum > 999999) {
      setError("El precio no puede superar Q999,999.00.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let imageUrl = payload.imagen;

      if (hasSelectedFile) {
        imageUrl = await uploadProductImage(currentFile);
      }

      const productPayload = { ...payload, imagen: imageUrl };

      if (editingId) await updateProduct(editingId, productPayload);
      else await createProduct(productPayload);

      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success(editingId ? "Producto actualizado." : "Producto creado.");
    } catch (err) {
      const detail =
        err?.response?.data?.imagen_file?.[0] ||
        err?.response?.data?.detail ||
        "No se pudo guardar el producto.";
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      nombre: product.nombre || "",
      descripcion: product.descripcion || "",
      precio: product.precio || "",
      categoria: product.categoria ? String(product.categoria) : "",
      estado: product.estado || "disponible",
      formula: product.formula || "",
      registro: product.registro || "",
      presentacion: product.presentacion || "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreview(product.imagen || "");
    setError("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Se eliminara este producto. Deseas continuar?",
    );
    if (!confirmDelete) return;

    try {
      setError("");
      await deleteProduct(id);
      if (editingId === id) resetForm();
      await queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Producto eliminado.");
    } catch {
      toast.error("No se pudo eliminar el producto.");
    }
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setPreview("");
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const paginatedProducts = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, page]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5edf7",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 8px 18px rgba(2, 32, 71, 0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: "#0b2b4b" }}>Productos</h1>
            <p style={{ color: "#5c6b7b", margin: "8px 0 0" }}>
              Crea, edita y elimina productos. Las imagenes se suben desde la
              PC.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                height: 42,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid #dbe7f7",
                background: "#fff",
                fontWeight: 800,
                cursor: "pointer",
                color: "#0b2b4b",
              }}
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="adminFormGrid">
          <div className="adminFieldGrid">
            <div className="adminField">
              <label htmlFor="producto-nombre">Nombre del producto</label>
              <input
                id="producto-nombre"
                className="adminInput"
                value={form.nombre}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nombre: event.target.value }))
                }
                placeholder="Ej. Neuroadvance Plus"
                required
              />
            </div>
            <div className="adminField">
              <label htmlFor="producto-precio">Precio</label>
              <input
                id="producto-precio"
                className="adminInput"
                value={form.precio}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, precio: event.target.value }))
                }
                placeholder="Q0.00"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="adminField">
              <label htmlFor="producto-formula">Fórmula</label>
              <input
                id="producto-formula"
                className="adminInput"
                value={form.formula}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, formula: e.target.value }))
                }
                placeholder="Principio activo"
              />
            </div>
            <div className="adminField">
              <label htmlFor="producto-registro">Registro sanitario</label>
              <input
                id="producto-registro"
                className="adminInput"
                value={form.registro}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, registro: e.target.value }))
                }
                placeholder="Número de registro"
              />
            </div>
            <div className="adminField">
              <label htmlFor="producto-presentacion">Presentación</label>
              <input
                id="producto-presentacion"
                className="adminInput"
                value={form.presentacion}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, presentacion: e.target.value }))
                }
                placeholder="Caja, frasco, cápsulas..."
              />
            </div>
            <div className="adminField">
              <label htmlFor="producto-categoria">Categoría</label>
              <select
                id="producto-categoria"
                className="adminInput"
                value={form.categoria}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, categoria: event.target.value }))
                }
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="adminField">
              <label htmlFor="producto-estado">Estado</label>
              <select
                id="producto-estado"
                className="adminInput"
                value={form.estado}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, estado: event.target.value }))
                }
              >
                <option value="disponible">Disponible</option>
                <option value="agotado">Agotado</option>
                <option value="descontinuado">Descontinuado</option>
              </select>
            </div>
          </div>

          <div className="adminField">
            <label htmlFor="producto-descripcion">Descripción</label>
            <textarea
              id="producto-descripcion"
              className="adminInput"
              value={form.descripcion}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, descripcion: event.target.value }))
              }
              placeholder="Descripción visible para el cliente"
              rows={4}
              style={{ resize: "vertical" }}
            />
          </div>

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
            <label htmlFor="producto-imagen" style={{ color: "#20344f", fontWeight: 700 }}>
              Imagen del producto
            </label>
            <input
              id="producto-imagen"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onClick={(event) => {
                event.target.value = "";
              }}
              onChange={onFileChange}
            />
            {preview && (
              <img
                src={preview}
                alt="Vista previa del producto"
                style={{
                  width: 160,
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 14,
                  border: "1px solid #e5edf7",
                }}
              />
            )}
          </div>

          {error && (
            <StatusBlock title="Revisa el formulario" message={error} tone="error" icon="!" />
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              height: 44,
              borderRadius: 12,
              border: "1px solid #dbe7f7",
              background: "#0b2b4b",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {saving
              ? "Guardando..."
              : editingId
                ? "Actualizar producto"
                : "Crear producto"}
          </button>
        </form>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e5edf7",
          borderRadius: 18,
          padding: 18,
        }}
      >
        <h2 style={{ margin: 0, color: "#0b2b4b" }}>Listado actual</h2>
        <p style={{ color: "#5c6b7b", marginTop: 8 }}>
          {isLoading
            ? "Cargando..."
            : `${products.length} producto(s) registrados`}
        </p>

        {isLoading ? (
          <StatusBlock
            title="Cargando productos"
            message="Estamos consultando el inventario administrativo."
            tone="loading"
            icon="..."
          />
        ) : products.length === 0 ? (
          <StatusBlock
            title="Aún no hay productos"
            message="Crea el primer producto para empezar a mostrar el catálogo de Farquetsa."
            icon="0"
          />
        ) : (
          <>
            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              {paginatedProducts.map((product) => (
                <article
                  key={product.id}
                  style={{
                    border: "1px solid #e5edf7",
                    borderRadius: 16,
                    padding: 14,
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "92px 1fr auto",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={
                      product.imagen || "https://via.placeholder.com/92?text=Img"
                    }
                    alt={product.nombre}
                    style={{
                      width: 92,
                      height: 92,
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />

                  <div>
                    <div style={{ fontWeight: 900, color: "#0b2b4b" }}>
                      {product.nombre}
                    </div>
                    <div style={{ color: "#5c6b7b", marginTop: 4 }}>
                      {categoryMap.get(String(product.categoria)) ||
                        product.categoria_nombre ||
                        "Sin categoría"}
                    </div>
                    <div style={{ color: "#20344f", marginTop: 4 }}>
                      Q{(Number(product.precio) || 0).toFixed(2)} |{" "}
                      {product.estado}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      style={secondaryBtnStyle}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      style={{ ...secondaryBtnStyle, color: "#b42318" }}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <Pagination
              page={page}
              totalItems={products.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              itemLabel="productos"
            />
          </>
        )}
      </section>
    </div>
  );
}

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

