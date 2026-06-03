import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCharts from "../components/DashboardCharts";
import SummaryCards from "../components/SummaryCards";
import { ErrorState, Loading } from "../components/State";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";
import type { Distribution, Donation, Summary } from "../lib/types";

export default function AdminDashboard() {
  const { t } = useI18n();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      api.get<Summary>("/admin/summary"),
      api.get<Donation[]>("/admin/donations"),
      api.get<Distribution[]>("/admin/distributions"),
    ])
      .then(([nextSummary, nextDonations, nextDistributions]) => {
        setSummary(nextSummary);
        setDonations(nextDonations);
        setDistributions(nextDistributions);
      })
      .catch((err) => setError(err.message));
  }, []);
  if (error) return <ErrorState message={error} />;
  if (!summary) return <Loading />;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">{t("adminDashboard")}</h1>
      <SummaryCards summary={summary} />
      <DashboardCharts summary={summary} donations={donations} distributions={distributions} />
      <div className="flex flex-wrap gap-3">
        <Link className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white" to="/admin/donations">{t("addDonation")}</Link>
        <Link className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white" to="/admin/households">{t("addHousehold")}</Link>
        <Link className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white" to="/admin/distributions">{t("addDistribution")}</Link>
      </div>
    </div>
  );
}
