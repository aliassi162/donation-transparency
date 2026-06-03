import { useI18n } from "../lib/i18n";

export const PAGE_SIZE = 10;

export function paginate<T>(rows: T[], page: number, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function pageCount(total: number, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export default function Pagination({
  page,
  total,
  onPageChange,
  pageSize = PAGE_SIZE,
}: {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}) {
  const { t } = useI18n();
  const totalPages = pageCount(total, pageSize);
  if (total <= pageSize) return null;

  return (
    <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>{t("pageOf", { page, total: totalPages })}</span>
      <div className="flex gap-2">
        <button className="bg-slate-100 text-slate-700 disabled:opacity-50" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          {t("previous")}
        </button>
        <button className="bg-slate-100 text-slate-700 disabled:opacity-50" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          {t("next")}
        </button>
      </div>
    </div>
  );
}
