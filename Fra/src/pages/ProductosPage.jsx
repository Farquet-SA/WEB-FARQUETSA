import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, getCategories } from "../api/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import "./productos.css";

export default function ProductosPage() {
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();

  // --- datos del servidor ---
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [loading, setLoading] = useState(true);

  // --- categorías para el sidebar ---
  const [categories, setCategories] = useState([]);

  // --- filtros (se mandan al backend) ---
  const [qInput, setQInput] = useState(""); // lo que el usuario escribe
  const [q, setQ] = useState("");            // lo que se manda al backend (debounced)
  const [sort, setSort] = useState("relevancia");
  const [selectedCats, setSelectedCats] = useState(new Set());
  const [selectedStates, setSelectedStates] = useState(new Set());
  const [priceMin, setPriceMin] = useState(0);   // se manda al backend (al soltar)
  const [priceMax, setPriceMax] = useState(0);
  const [sliderMin, setSliderMin] = useState(0);   // solo visual (mientras se mueve)
  const [sliderMax, setSliderMax] = useState(0);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });

  // Cargar categorías y bounds de precio una sola vez
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));

    // Pedir todos los precios al backend para calcular bounds reales
    getProducts(1, { page_size: 1000 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.results ?? [];
        const nums = list.map((p) => Number(p?.precio)).filter((n) => Number.isFinite(n));
        if (nums.length) {
          const min = 0;
          const max = Math.ceil(Math.max(...nums));
          setPriceBounds({ min, max });
          setPriceMin(min);
          setPriceMax(min);
          setSliderMin(min);
          setSliderMax(max);
          setPriceMax(max);
        }
      })
      .catch(() => {});
  }, []);

  // Sincronizar q con searchParams
  useEffect(() => {
    const qParam = searchParams.get("q") ?? "";
    setQInput(qParam);
    setQ(qParam);
  }, [searchParams]);

  // Debounce: esperar 400ms después de que el usuario deje de escribir
  useEffect(() => {
    const timer = setTimeout(() => setQ(qInput), 400);
    return () => clearTimeout(timer);
  }, [qInput]);

  const fetchPage = useCallback(
    async (page) => {
      try {
        setLoading(true);

        // Armar filtros para el backend
        const filters = {};
        if (q) filters.q = q;
        if (selectedCats.size === 1) {
          // El backend acepta un solo categoria_id; si hay varios haría falta
          // soporte multi-valor en el backend (por ahora mandamos el primero)
          filters.categoria = [...selectedCats][0];
        }
        if (selectedStates.size === 1) {
          filters.estado = [...selectedStates][0].toLowerCase();
        }
        if (priceMin !== priceBounds.min) filters.precio_min = priceMin;
        if (priceMax !== priceBounds.max) filters.precio_max = priceMax;

        const data = await getProducts(page, filters);
        const list = Array.isArray(data) ? data : data?.results ?? [];
        const count = data?.count ?? list.length;

        setProducts(list);
        setTotalCount(count);
        if (page === 1) setPageSize(list.length || 12);
        setCurrentPage(page);

      } catch (e) {
        console.error("Error cargando productos", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [q, selectedCats, selectedStates, priceMin, priceMax]
  );

  // Volver a página 1 cada vez que cambien los filtros
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1;

  const estadosDisponibles = ["DISPONIBLE", "AGOTADO", "DESCONTINUADO"];

  const toggleSetValue = (setter, value) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  // Ordenamiento client-side (solo sobre la página actual, es cosmético)
  const sorted = useMemo(() => {
    const list = [...products];
    const priceNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    if (sort === "precio_asc")
      list.sort((a, b) => priceNum(a.precio) - priceNum(b.precio));
    if (sort === "precio_desc")
      list.sort((a, b) => priceNum(b.precio) - priceNum(a.precio));
    if (sort === "nombre")
      list.sort((a, b) =>
        (a.nombre || "").localeCompare(b.nombre || "", "es")
      );
    return list;
  }, [products, sort]);

  // Paginación con "..."
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchPage(page);
  };

  return (
    <div className="catalogWrap">
      <div className="catalogTop">
        <div className="catalogTitle">
          <h1>Todos los Medicamentos</h1>
          <p>
            {loading
              ? "Cargando..."
              : `${totalCount} productos — Página ${currentPage} de ${totalPages}`}
          </p>
        </div>

        <div className="catalogSearchRow">
          <div className="searchBox">
            <span className="searchIcon">⌕</span>
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Buscar medicamentos por nombre o principio activo..."
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sortSelect"
          >
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
              <span>Q{sliderMin}</span>
              <span>Q{sliderMax}</span>
            </div>
            <div className="rangeWrap">
              <input type="range" min={priceBounds.min} max={priceBounds.max} value={sliderMin}
                onChange={(e) => setSliderMin(Math.min(Number(e.target.value), sliderMax))}
                onMouseUp={(e) => setPriceMin(Math.min(Number(e.target.value), sliderMax))}
                onTouchEnd={(e) => setPriceMin(Math.min(Number(e.target.value), sliderMax))}
                className="rangeInput" />
              <input type="range" min={priceBounds.min} max={priceBounds.max} value={sliderMax}
                onChange={(e) => setSliderMax(Math.max(Number(e.target.value), sliderMin))}
                onMouseUp={(e) => setPriceMax(Math.max(Number(e.target.value), sliderMin))}
                onTouchEnd={(e) => setPriceMax(Math.max(Number(e.target.value), sliderMin))}
                className="rangeInput" />
            </div>
            <button className="clearBtn" type="button"
              onClick={() => { setPriceMin(priceBounds.min); setPriceMax(priceBounds.max); setSliderMin(priceBounds.min); setSliderMax(priceBounds.max); }}
              disabled={priceMin === priceBounds.min && priceMax === priceBounds.max}>
              Limpiar precio
            </button>
            <p className="hint">Mostrando productos entre Q{sliderMin} y Q{sliderMax}.</p>
          </div>

          <div className="filterBlock">
            <p className="filterLabel">Estado</p>
            <div className="pillList">
              {estadosDisponibles.map((st) => (
                <button
                  key={st}
                  className={`pill pillState ${
                    selectedStates.has(st) ? "active" : ""
                  } ${st}`}
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
                  className={`pill ${
                    selectedCats.has(String(cat.id)) ? "active" : ""
                  }`}
                  type="button"
                  onClick={() =>
                    toggleSetValue(setSelectedCats, String(cat.id))
                  }
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

        {/* Grid + paginación */}
        <section className="gridWrap">
          {loading ? (
            <div className="stateBox">Cargando productos…</div>
          ) : sorted.length === 0 ? (
            <div className="stateBox">
              <strong>No hay productos</strong>
              <p>Prueba con otra búsqueda o ajusta los filtros.</p>
            </div>
          ) : (
            <div className="grid">
              {sorted.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addItem} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {!loading && totalPages > 1 && (
            <nav className="pagination" aria-label="Paginación de productos">
              <button
                className="pageBtn pageNavBtn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                ‹
              </button>

              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="pageDots">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`pageBtn ${
                      p === currentPage ? "pageActive" : ""
                    }`}
                    onClick={() => goToPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="pageBtn pageNavBtn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
              >
                ›
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
