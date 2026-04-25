import { useState, useEffect, useMemo } from "react";
import "./historial.css";
import Pagination from "../../components/Pagination";
import { getHistorial, tiempodelimpieza, getTiempoLimpieza } from "../../api/historial";

const OPCIONES_LIMPIEZA = [
  { label: "Nunca", meses: 0 },
  { label: "Cada 2 meses", meses: 2 },
  { label: "Cada 6 meses", meses: 6 },
  { label: "Cada año", meses: 12 },
];

const MAPA_MODULOS = {
  "Todos": null,
  "Productos": "productos",
  "Categorías": "categorias",
  "Usuarios": "usuarios"
};
const PAGE_SIZE = 20;

export default function Historial() {
  const [filtro, setFiltro] = useState("Todos");
  const [historial, setHistorial] = useState([]);
  const [limpieza, setLimpieza] = useState(""); // Estado para el label visible
  const [configuracionReal, setConfiguracionReal] = useState(null); // Para volver atrás si cancela
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [page, setPage] = useState(1);


  useEffect(() => {
    const inicializar = async () => {
      try {
        const mesesBD = await getTiempoLimpieza();
        const encontrada = OPCIONES_LIMPIEZA.find(o => o.meses === mesesBD) || OPCIONES_LIMPIEZA[0];
        setLimpieza(encontrada.label);
        setConfiguracionReal(encontrada.label);
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };
    inicializar();
  }, []);


  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getHistorial({ modulo: MAPA_MODULOS[filtro] });
        setHistorial(data);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      }
    };
    loadData();
    setPage(1);
  }, [filtro]);

  const handleLimpiezaChange = (e) => {
    setLimpieza(e.target.value);
    setMostrarConfirmacion(true);
  };

  const handleConfirmar = async () => {
    try {
      const opcion = OPCIONES_LIMPIEZA.find((o) => o.label === limpieza);
      await tiempodelimpieza(opcion.meses);
      setConfiguracionReal(limpieza); 
      

      const data = await getHistorial({ modulo: MAPA_MODULOS[filtro] });
      setHistorial(data);
    } catch (error) {
      console.error("Error al guardar:", error);
      setLimpieza(configuracionReal);
    } finally {
      setMostrarConfirmacion(false);
    }
  };

  const handleCancelar = () => {
    setLimpieza(configuracionReal);
    setMostrarConfirmacion(false);
  };

  const exportarPDF = async () => {
    setExportando(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF();
      doc.text("Historial de acciones", 14, 15);
      const tabla = historial.map((item) => [
        item.usuario,
        item.accion,
        item.fecha,
        item.hora,
        item.detalle,
      ]);
      autoTable(doc, {
        head: [["Usuario", "Acción", "Fecha", "Hora", "Detalle"]],
        body: tabla,
        startY: 20,
      });
      doc.save("historial.pdf");
    } finally {
      setExportando(false);
    }
  };

  const paginatedHistorial = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(historial.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return historial.slice(start, start + PAGE_SIZE);
  }, [historial, page]);

  return (
    <div className="historial-container">
      <h2>Historial de acciones</h2>

      <div className="historial-layout">
        <div className="historial-tabla-wrapper">
        <table className="historial-tabla">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {historial.length > 0 ? (
              paginatedHistorial.map((item, index) => (
                <tr key={`${item.fecha}-${item.hora}-${index}`}>
                  <td>{item.usuario}</td>
                  <td>{item.accion}</td>
                  <td>{item.fecha}</td>
                  <td>{item.hora}</td>
                  <td>{item.detalle}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="sin-resultados">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalItems={historial.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="registros"
        />
        </div>

        <div className="historial-panel">
          <div className="filtros">
            {Object.keys(MAPA_MODULOS).map((tipo) => (
              <button
                key={tipo}
                className={`btn-filtro ${filtro === tipo ? "activo" : ""}`}
                onClick={() => setFiltro(tipo)}
              >
                {tipo}
              </button>
            ))}
          </div>

          <div className="limpieza">
            <label className="limpieza-label">🗑️ Frecuencia de limpieza:</label>
            <select
              className="limpieza-select"
              value={limpieza}
              onChange={handleLimpiezaChange}
            >
              {OPCIONES_LIMPIEZA.map((o) => (
                <option key={o.label} value={o.label}>{o.label}</option>
              ))}
            </select>
          </div>

          <button className="btn-pdf" onClick={exportarPDF} disabled={exportando}>
            {exportando ? "Exportando..." : "Exportar PDF"}
          </button>
        </div>
      </div>

      {mostrarConfirmacion && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-titulo">¿Cambiar frecuencia de limpieza?</h3>
            <p className="modal-texto">
              {limpieza === "Nunca" 
                ? "Se dejarán de eliminar registros automáticamente." 
                : `Se conservarán solo los registros de los últimos ${limpieza.toLowerCase().replace("cada ", "")}.`}
            </p>
            <div className="modal-acciones">
              <button className="modal-cancelar" onClick={handleCancelar}>Cancelar</button>
              <button className="modal-confirmar" onClick={handleConfirmar}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
