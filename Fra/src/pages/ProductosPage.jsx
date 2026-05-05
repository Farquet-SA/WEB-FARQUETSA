import { useCallback, useEffect, useMemo, useState } from "react";
import { getProducts } from "../api/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import "./productos.css";

export default function ProductosPage() {
  const { addItem } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros UI
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("relevancia"); // relevancia | precio_asc | precio_desc | nombre

  // filtros multi
  const [selectedCats, setSelectedCats] = useState(new Set()); // guardaremos IDs como string
  const [selectedStates, setSelectedStates] = useState(new Set()); // DISPONIBLE/AGOTADO/DESCONTINUADO
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500);
    // límites reales según data (para que el slider se adapte)
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 500 });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
                const data = await getProducts();
        const list = Array.isArray(data) ? data : data?.results ?? [];
        setProducts(list);

        // calcular límites reales de precio (min/max)
        const nums = list
          .map((p) => Number(p?.precio))
          .filter((n) => Number.isFinite(n));

        const min = nums.length ? Math.floor(Math.min(...nums)) : 0;
        const max = nums.length ? Math.ceil(Math.max(...nums)) : 500;

        setPriceBounds({ min, max });
        setPriceMin(min);
        setPriceMax(max);

      } catch (e) {
        console.error("Error cargando productos", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // helpers
  const norm = (v) => String(v ?? "").trim().toLowerCase();

  const normalizeEstado = useCallback((p) => {
    const e = norm(p?.estado);

    if (e.includes("des") || e.includes("discont")) return "DESCONTINUADO";
    if (e.includes("agot")) return "AGOTADO";
    if (e.includes("disp")) return "DISPONIBLE";

    // fallback por boolean disponible
    const disp = p?.disponible ?? true;
    return disp ? "DISPONIBLE" : "AGOTADO";
  }, []);

  // ✅ aquí está el arreglo real:
  // devolvemos { id: "1", nombre: "Analgésicos" }
  // si no viene categoria_nombre, caemos a "Otros"
  const getCategoriaObj = (p) => {
    const id = p?.categoria != null ? String(p.categoria) : "";
    const nombre = String(p?.categoria_nombre ?? "").trim();
    return {
      id: id || "otros",
      nombre: nombre || "Otros",
    };
  };

  // listado de categorías reales (desde data)
  const categories = useMemo(() => {
    const map = new Map(); // id -> nombre

    for (const p of products) {
      const c = getCategoriaObj(p);
      if (!map.has(c.id)) map.set(c.id, c.nombre);
    }

    return Array.from(map.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [products]);

  const estadosDisponibles = useMemo(() => {
    return ["DISPONIBLE", "AGOTADO", "DESCONTINUADO"];
  }, []);

  const toggleSetValue = (setter, value) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = [...products];

    // búsqueda
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (p) =>
          (p.nombre || "").toLowerCase().includes(query) ||
          (p.descripcion || "").toLowerCase().includes(query)
      );
    }

    list = list.filter((p) => {
      const pr = Number(p?.precio);
      if (!Number.isFinite(pr)) return false;
      return pr >= priceMin && pr <= priceMax;
    });

    // filtro por categorías (por id)
    if (selectedCats.size > 0) {
      list = list.filter((p) => selectedCats.has(getCategoriaObj(p).id));
    }

    // filtro por estados
    if (selectedStates.size > 0) {
      list = list.filter((p) => selectedStates.has(normalizeEstado(p)));
    }

    // ordenar
    const priceNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    if (sort === "precio_asc") list.sort((a, b) => priceNum(a.precio) - priceNum(b.precio));
    if (sort === "precio_desc") list.sort((a, b) => priceNum(b.precio) - priceNum(a.precio));
    if (sort === "nombre")
      list.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));

    return list;
  }, [products, q, sort, selectedCats, selectedStates, priceMin, priceMax, normalizeEstado]);

  return (
    <div className="catalogWrap">
      <div className="catalogTop">
        <div className="catalogTitle">
          <h1>Todos los Medicamentos</h1>
          <p>{loading ? "Cargando..." : `${filtered.length} productos`}</p>
        </div>

        <div className="catalogSearchRow">
          <div className="searchBox">
            <span className="searchIcon">⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar medicamentos por nombre o principio activo..."
            />
          </div>

          <select value={sort} onChange={(e) => setSort(e.target.value)} className="sortSelect">
            <option value="relevancia">Ordenar: Relevancia</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="nombre">Nombre: A → Z</option>
          </select>
        </div>
      </div>

      <div className="catalogBody">
        {/* Sidebar filtros */}
        <aside className="filters">
          <h3>Filtros</h3>

          <div className="filterBlock">
  <p className="filterLabel">Rango de Precio</p>

  <div className="rangeValues">
    <span>Q{priceMin}</span>
    <span>Q{priceMax}</span>
  </div>

  <div className="rangeWrap">
    <input
      type="range"
      min={priceBounds.min}
      max={priceBounds.max}
      value={priceMin}
      onChange={(e) => {
        const v = Number(e.target.value);
        setPriceMin(Math.min(v, priceMax)); // no pasar el max
      }}
      className="rangeInput"
    />

    <input
      type="range"
      min={priceBounds.min}
      max={priceBounds.max}
      value={priceMax}
      onChange={(e) => {
        const v = Number(e.target.value);
        setPriceMax(Math.max(v, priceMin)); // no bajar del min
      }}
      className="rangeInput"
    />
  </div>

  <button
    className="clearBtn"
    type="button"
    onClick={() => {
      setPriceMin(priceBounds.min);
      setPriceMax(priceBounds.max);
    }}
    disabled={priceMin === priceBounds.min && priceMax === priceBounds.max}
  >
    Limpiar precio
  </button>

  <p className="hint">
    Mostrando productos entre Q{priceMin} y Q{priceMax}.
  </p>
</div>


          <div className="filterBlock">
            <p className="filterLabel">Estado</p>

            <div className="pillList">
              {estadosDisponibles.map((st) => (
                <button
                  key={st}
                  className={`pill pillState ${selectedStates.has(st) ? "active" : ""} ${st}`}
                  type="button"
                  onClick={() => toggleSetValue(setSelectedStates, st)}
                >
                  {st === "DISPONIBLE"
                    ? "Disponible"
                    : st === "AGOTADO"
                    ? "Agotado"
                    : "Descontinuado"}
                </button>
              ))}
            </div>

            <button
              className="clearBtn"
              type="button"
              onClick={() => setSelectedStates(new Set())}
              disabled={selectedStates.size === 0}
            >
              Limpiar estado
            </button>
          </div>

          <div className="filterBlock">
            <p className="filterLabel">Categoría</p>

            <div className="pillList">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`pill ${selectedCats.has(cat.id) ? "active" : ""}`}
                  type="button"
                  onClick={() => toggleSetValue(setSelectedCats, cat.id)}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>

            <button
              className="clearBtn"
              type="button"
              onClick={() => setSelectedCats(new Set())}
              disabled={selectedCats.size === 0}
            >
              Limpiar categorías
            </button>
          </div>

        </aside>

        {/* Grid productos */}
        <section className="gridWrap">
          {loading ? (
            <div className="stateBox">Cargando productos…</div>
          ) : filtered.length === 0 ? (
            <div className="stateBox">
              <strong>No hay productos</strong>
              <p>Prueba con otra búsqueda o ajusta los filtros.</p>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addItem} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
