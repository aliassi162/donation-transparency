import { useI18n } from "../lib/i18n";

export function Loading() {
  const { t } = useI18n();
  return <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">{t("loading")}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">{message}</div>;
}
