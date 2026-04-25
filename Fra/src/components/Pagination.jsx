import { useEffect, useMemo } from "react";
import "./pagination.css";

const getVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "start-ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "start-ellipsis", currentPage - 1, currentPage, currentPage + 1, "end-ellipsis", totalPages];
};

export default function Pagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = "registros",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  useEffect(() => {
    if (page !== currentPage) onPageChange(currentPage);
  }, [currentPage, onPageChange, page]);

  if (totalItems <= pageSize) {
    return (
      <div className="paginationSummary">
        {totalItems} {itemLabel}
      </div>
    );
  }

  return (
    <nav className="pagination" aria-label="Paginación">
      <div className="paginationSummary">
        Mostrando {start}-{end} de {totalItems} {itemLabel}
      </div>

      <div className="paginationControls">
        <button
          type="button"
          className="paginationBtn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>

        <div className="paginationPages">
          {pages.map((item) => (
            typeof item === "number" ? (
              <button
                type="button"
                key={item}
                className={`paginationPage${item === currentPage ? " active" : ""}`}
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="paginationEllipsis" aria-hidden="true">
                ...
              </span>
            )
          ))}
        </div>

        <button
          type="button"
          className="paginationBtn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
