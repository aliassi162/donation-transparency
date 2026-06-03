import { money } from "../lib/api";
import { assistanceTypeLabel } from "../lib/assistanceTypes";
import { useI18n } from "../lib/i18n";
import type { Distribution, PublicDistribution, PublicDonation, Summary } from "../lib/types";

type DonationLike = Pick<PublicDonation, "amount" | "received_date">;
type DistributionLike = Pick<PublicDistribution | Distribution, "amount" | "distribution_date" | "assistance_type">;

function buildTypeData(distributions: DistributionLike[]) {
  const totals = new Map<string, number>();
  distributions.forEach((row) => {
    const label = row.assistance_type || "Other";
    totals.set(label, (totals.get(label) || 0) + Number(row.amount));
  });
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

export default function DashboardCharts({
  summary,
  donations,
  distributions,
  donationScope = "received",
}: {
  summary: Summary;
  donations: DonationLike[];
  distributions: DistributionLike[];
  donationScope?: "received" | "public";
}) {
  const { t } = useI18n();
  const typeData = buildTypeData(distributions).map(([label, value]) => [label === "Other" ? t("other") : assistanceTypeLabel(label, t), value] as const);
  const received = Number(summary.total_received);
  const distributed = Number(summary.total_distributed);
  const remaining = Math.max(Number(summary.remaining_balance), 0);
  const distributedPercent = received > 0 ? Math.min((distributed / received) * 100, 100) : 0;
  const remainingPercent = received > 0 ? Math.min((remaining / received) * 100, 100) : 0;
  const maxType = Math.max(1, ...typeData.map(([, value]) => value));
  const circumference = 2 * Math.PI * 44;
  const distributedOffset = circumference - (distributedPercent / 100) * circumference;

  return (
    <section className="grid gap-4 lg:grid-cols-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-3">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-lg font-semibold sm:text-xl">{t("fundOverview")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("fundOverviewNote")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
          <div className="relative mx-auto h-36 w-36 sm:h-52 sm:w-52">
            <svg className="-rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="44" fill="none" stroke="#e2e8f0" strokeWidth="14" />
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke="#059669"
                strokeLinecap="round"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={distributedOffset}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-2xl font-semibold text-slate-950 sm:text-3xl">{distributedPercent.toFixed(0)}%</p>
                <p className="mt-1 text-sm text-slate-500">{t("distributed")}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{t("distributed")}</span>
                <span className="font-semibold text-emerald-700">{money(distributed)}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${distributedPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{t("remaining")}</span>
                <span className="font-semibold text-slate-700">{money(remaining)}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-400" style={{ width: `${remainingPercent}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-800 sm:p-4">
                <p className="text-xs font-medium uppercase">{t("donationCount")}</p>
                <p className="mt-2 text-xl font-semibold sm:text-2xl">{summary.donations_count}</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-3 text-sky-800 sm:p-4">
                <p className="text-xs font-medium uppercase">{t("distributionCount")}</p>
                <p className="mt-2 text-xl font-semibold sm:text-2xl">{summary.distributions_count}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold sm:text-xl">{t("aidByType")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("assistanceCoverage")}</p>
          {typeData.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">{t("noDistributionTypes")}</p>
          ) : (
            <div className="mt-5 space-y-5">
              {typeData.map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="truncate font-medium capitalize">{label}</span>
                    <span className="text-slate-500">{money(value)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-sky-600" style={{ width: `${(value / maxType) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}
