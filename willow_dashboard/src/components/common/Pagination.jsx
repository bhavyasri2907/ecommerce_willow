import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '../../utils/formatNumber.js';

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = new Set([0, total - 1, current - 1, current, current + 1]);
  const list = [...pages].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
  const out = [];
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, size, totalElements, totalPages, onPageChange, onSizeChange, sizes = [10, 20, 50] }) {
  if (!totalElements) return null;
  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  return (
    <div className="pagination">
      <div className="pagination__info">
        Showing <strong>{formatNumber(from)}–{formatNumber(to)}</strong> of <strong>{formatNumber(totalElements)}</strong>
        {onSizeChange && (
          <select
            className="pagination__size"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            aria-label="Rows per page"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        )}
      </div>
      <nav className="pagination__pages" aria-label="Pagination">
        <button className="page-btn" disabled={page === 0} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {pageWindow(page, totalPages).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="page-gap">…</span>
          ) : (
            <button
              key={p}
              className={`page-btn ${p === page ? 'is-active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p + 1}
            </button>
          )
        )}
        <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
