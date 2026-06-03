import type React from "react";
import { useEffect, useState } from "react";
import DashboardCharts from "../components/DashboardCharts";
import LanguageToggle from "../components/LanguageToggle";
import Pagination, { paginate } from "../components/Pagination";
import SummaryCards from "../components/SummaryCards";
import { EmptyState, ErrorState, Loading } from "../components/State";
import { api, formatDate, money } from "../lib/api";
import { assistanceTypeLabel } from "../lib/assistanceTypes";
import { useI18n } from "../lib/i18n";
import type { PublicDonation, PublicDistribution, Summary } from "../lib/types";

export default function PublicDashboard() {
  const { t } = useI18n();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [donations, setDonations] = useState<PublicDonation[]>([]);
  const [distributions, setDistributions] = useState<PublicDistribution[]>([]);
  const [donationSort, setDonationSort] = useState("date-desc");
  const [distributionSort, setDistributionSort] = useState("date-desc");
  const [donationPage, setDonationPage] = useState(1);
  const [distributionPage, setDistributionPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const [donationSortBy, donationOrder] = donationSort.split("-");
    const [distributionSortBy, distributionOrder] = distributionSort.split("-");
    Promise.all([
      api.get<Summary>("/public/summary"),
      api.get<PublicDonation[]>(`/public/donations?sort_by=${donationSortBy}&order=${donationOrder}`),
      api.get<PublicDistribution[]>(`/public/distributions?sort_by=${distributionSortBy}&order=${distributionOrder}`),
    ])
      .then(([s, d, dist]) => {
        setSummary(s);
        setDonations(d);
        setDistributions(dist);
      })
      .catch((err) => setError(err.message));
  }, [donationSort, distributionSort]);

  if (error) return <Page><ErrorState message={error} /></Page>;
  if (!summary) return <Page><Loading /></Page>;

  const donorLabel = (name: string) => (name === "Private" ? t("private") : name);
  const isPrivateDonor = (name: string) => name === "Private";
  const donorName = (name: string) =>
    isPrivateDonor(name) ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{t("private")}</span> : donorLabel(name);
  const paginatedDonations = paginate(donations, donationPage);
  const paginatedDistributions = paginate(distributions, distributionPage);

  return (
    <Page>
      <section className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm sm:p-5">
        <h2 className="text-xl font-semibold text-slate-950">{t("aboutTitle")}</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700 sm:text-base">{t("aboutText")}</p>
      </section>
      <SummaryCards summary={summary} />
      <DashboardCharts summary={summary} donations={donations} distributions={distributions} donationScope="public" />
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">{t("recentPublicDonations")}</h2>
            <SortSelect value={donationSort} onChange={(value) => { setDonationSort(value); setDonationPage(1); }} />
          </div>
          {donations.length === 0 ? <EmptyState message={t("noPublicDonations")} /> : (
            <>
            <div className="space-y-3 md:hidden">
              {paginatedDonations.map((row, i) => (
                <div key={i} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-900">{donorName(row.donor_display_name)}</p>
                    <p className="text-sm font-semibold text-emerald-700">{money(row.amount)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{row.donor_country || "-"} / {formatDate(row.received_date)}</p>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500"><tr><th className="py-2">{t("donor")}</th><th>{t("donorCountry")}</th><th>{t("amount")}</th><th>{t("date")}</th></tr></thead>
                <tbody>{paginatedDonations.map((row, i) => <tr className="border-t" key={i}><td className="py-2">{donorName(row.donor_display_name)}</td><td>{row.donor_country || "-"}</td><td>{money(row.amount)}</td><td>{formatDate(row.received_date)}</td></tr>)}</tbody>
              </table>
            </div>
            <Pagination page={donationPage} total={donations.length} onPageChange={setDonationPage} />
            </>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">{t("recentDistributions")}</h2>
            <SortSelect value={distributionSort} onChange={(value) => { setDistributionSort(value); setDistributionPage(1); }} />
          </div>
          {distributions.length === 0 ? <EmptyState message={t("noDistributionsRecorded")} /> : (
            <>
            <div className="space-y-3 md:hidden">
              {paginatedDistributions.map((row, i) => (
                <div key={`${row.household_code}-${row.distribution_date}-${i}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{row.household_code}</p>
                      <p className="mt-1 text-xs text-slate-500">{row.location || "-"} / {assistanceTypeLabel(row.assistance_type, t)} / {formatDate(row.distribution_date)}</p>
                    </div>
                    <p className="text-sm font-semibold text-sky-700">{money(row.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500"><tr><th className="py-2">{t("householdId")}</th><th>{t("location")}</th><th>{t("amount")}</th><th>{t("type")}</th><th>{t("date")}</th></tr></thead>
                <tbody>{paginatedDistributions.map((row, i) => <tr className="border-t" key={`${row.household_code}-${row.distribution_date}-${i}`}><td className="py-2">{row.household_code}</td><td>{row.location || "-"}</td><td>{money(row.amount)}</td><td>{assistanceTypeLabel(row.assistance_type, t)}</td><td>{formatDate(row.distribution_date)}</td></tr>)}</tbody>
              </table>
            </div>
            <Pagination page={distributionPage} total={distributions.length} onPageChange={setDistributionPage} />
            </>
          )}
        </div>
      </section>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ecfdf5,transparent_35%),#f8fafc]">
      <div className="mx-auto max-w-6xl space-y-5 p-3 sm:p-4 md:space-y-6 md:p-8">
      <header className="flex flex-col gap-4 border-b border-emerald-100 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{t("publicDashboard")}</p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">{t("publicTitle")}</h1>
          <p className="mt-2 max-w-2xl text-slate-600">{t("transparencyOnly")}</p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 md:w-auto md:justify-end">
          <LanguageToggle />
        </div>
      </header>
      {children}
      </div>
    </main>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useI18n();
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span>{t("sortBy")}</span>
      <select className="w-auto py-1" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="date-desc">{t("newestFirst")}</option>
        <option value="date-asc">{t("oldestFirst")}</option>
        <option value="amount-desc">{t("highestAmount")}</option>
        <option value="amount-asc">{t("lowestAmount")}</option>
      </select>
    </label>
  );
}
