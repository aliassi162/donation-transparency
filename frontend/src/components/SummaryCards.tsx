import type { LucideIcon } from "lucide-react";
import { CircleDollarSign, HandCoins, Home, Wallet } from "lucide-react";
import { money } from "../lib/api";
import { useI18n } from "../lib/i18n";
import type { Summary } from "../lib/types";

export default function SummaryCards({ summary }: { summary: Summary }) {
  const { t } = useI18n();
  const cards: { label: string; value: string; tone: string; Icon: LucideIcon }[] = [
    { label: t("totalReceived"), value: money(summary.total_received), tone: "bg-emerald-50 text-emerald-700", Icon: CircleDollarSign },
    { label: t("totalDistributed"), value: money(summary.total_distributed), tone: "bg-sky-50 text-sky-700", Icon: HandCoins },
    { label: t("remainingBalance"), value: money(summary.remaining_balance), tone: "bg-slate-100 text-slate-700", Icon: Wallet },
    { label: t("familiesAssisted"), value: summary.families_assisted_count.toString(), tone: "bg-amber-50 text-amber-700", Icon: Home },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, tone, Icon }) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
              <Icon size={18} />
            </span>
            <p className="text-sm font-medium leading-tight text-slate-500">{label}</p>
          </div>
          <p className="mt-3 break-words text-xl font-semibold text-slate-950 sm:text-2xl">{value}</p>
        </div>
      ))}
    </div>
  );
}
