import { useCallback, useEffect, useMemo, useState } from "react";
import { getProducts } from "../api/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import StatusBlock from "../components/StatusBlock";
import "./productos.css";

const PAGE_SIZE = 12;

export default function ProductosPage() {
  const { addItem } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
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
        setLoadError("No pudimos cargar el catálogo en este momento.");
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

  const getCategoriaObj = (p) => {
    const id = p?.categoria != null ? String(p.categoria) : "";
    const nombre = String(p?.categoria_nombre ?? "").trim();
    return {
      id: id || "otros",
      nombre: nombre || "Otros",
    };
  };

  const categories = useMemo(() => {
    const map = new Map();

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

    if (selectedCats.size > 0) {
      list = list.filter((p) => selectedCats.has(getCategoriaObj(p).id));
    }

    if (selectedStates.size > 0) {
      list = list.filter((p) => selectedStates.has(normalizeEstado(p)));
    }

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

  useEffect(() => {
    setPage(1);
  }, [q, sort, selectedCats, selectedStates, priceMin, priceMax]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

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
            <label className="srOnly" htmlFor="catalog-search">
              Buscar medicamentos
            </label>
            <input
              id="catalog-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar medicamentos por nombre o principio activo..."
            />
          </div>

          <label className="srOnly" htmlFor="catalog-sort">
            Ordenar productos
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sortSelect"
          >
            <option value="relevancia">Ordenar: Relevancia</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="nombre">Nombre: A-Z</option>
          </select>
        </div>
      </div>

      <div className="catalogBody">
        <aside className="filters" aria-label="Filtros de productos">
          <h3>Filtros</h3>

          <div className="filterBlock">
            <p className="filterLabel">Rango de precio</p>

            <div className="rangeValues">
              <span>Q{priceMin}</span>
              <span>Q{priceMax}</span>
            </div>

            <div className="rangeWrap">
              <label className="srOnly" htmlFor="price-min">
                Precio mínimo
              </label>
              <input
                id="price-min"
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPriceMin(Math.min(v, priceMax));
                }}
                className="rangeInput"
              />

              <label className="srOnly" htmlFor="price-max">
                Precio máximo
              </label>
              <input
                id="price-max"
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPriceMax(Math.max(v, priceMin));
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

        <section className="gridWrap" aria-live="polite">
          {loading ? (
            <StatusBlock
              title="Cargando productos"
              message="Estamos preparando el catálogo disponible."
              tone="loading"
              icon="..."
            />
          ) : loadError ? (
            <StatusBlock
              title="No se pudo cargar el catálogo"
              message={loadError}
              tone="error"
              icon="!"
            />
          ) : filtered.length === 0 ? (
            <StatusBlock
              title="No hay productos para mostrar"
              message="Prueba con otra búsqueda, limpia los filtros o revisa el rango de precio."
              icon="0"
            />
          ) : (
            <div className="grid">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addItem} />
              ))}
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <Pagination
              page={page}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              itemLabel="productos"
            />
          )}
        </section>
      </div>
    </div>
  );
}
