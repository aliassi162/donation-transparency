import type { ReactNode } from "react";
import { useI18n } from "../lib/i18n";

export function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  const { t } = useI18n();
  return (
    <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
      <span>{children}</span>
      {required && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-emerald-700">{t("required")}</span>}
    </span>
  );
}
