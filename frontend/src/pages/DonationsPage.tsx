import { FormEvent, useEffect, useState } from "react";
import { FieldLabel } from "../components/FormField";
import Pagination, { paginate } from "../components/Pagination";
import { EmptyState, ErrorState, Loading } from "../components/State";
import { api, formatDate, money } from "../lib/api";
import { countries } from "../lib/countries";
import { useI18n } from "../lib/i18n";
import type { Donation } from "../lib/types";

type DonationForm = { donor_name: string; donor_display_name: string; donor_country: string; is_public: boolean; amount: string; received_date: string; notes: string };
const blank: DonationForm = { donor_name: "", donor_display_name: "", donor_country: "", is_public: false, amount: "", received_date: "", notes: "" };

export default function DonationsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Donation[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => api.get<Donation[]>("/admin/donations").then((nextRows) => { setRows(nextRows); setPage(1); }).finally(() => setLoading(false));
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      if (editing) await api.put(`/admin/donations/${editing}`, form);
      else await api.post("/admin/donations", form);
      setForm(blank); setEditing(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : t("saveFailed")); }
  }

  const paginatedRows = paginate(rows, page);

  return <section className="space-y-4">
    <h1 className="text-2xl font-semibold">{t("donations")}</h1>
    {error && <ErrorState message={error} />}
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><FieldLabel required>{t("amount")}</FieldLabel><input placeholder={t("amount")} type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></label>
        <label className="block"><FieldLabel required>{t("date")}</FieldLabel><input type="date" value={form.received_date} onChange={(e) => setForm({ ...form, received_date: e.target.value })} required /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block"><FieldLabel>{t("privateDonorName")}</FieldLabel><input placeholder={t("privateDonorName")} value={form.donor_name} onChange={(e) => setForm({ ...form, donor_name: e.target.value })} /></label>
        <label className="block"><FieldLabel>{t("publicDisplayName")}</FieldLabel><input placeholder={t("publicDisplayName")} value={form.donor_display_name} onChange={(e) => setForm({ ...form, donor_display_name: e.target.value })} /></label>
        <label className="block"><FieldLabel>{t("donorCountry")}</FieldLabel><select value={form.donor_country} onChange={(e) => setForm({ ...form, donor_country: e.target.value })}>
          <option value="">{t("donorCountry")}</option>
          {countries.map((country) => <option key={country} value={country}>{country}</option>)}
        </select></label>
      </div>
      <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3">
        <label className="flex items-start gap-3 text-sm font-medium text-emerald-900">
          <input className="mt-1 w-auto" type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} />
          <span><span className="block">{t("publicDonor")}</span><span className="mt-1 block text-xs font-normal text-emerald-800">{t("publicDonorHelp")}</span></span>
        </label>
      </div>
      <label className="block"><FieldLabel>{t("notes")}</FieldLabel><textarea placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
      <button className="bg-emerald-700 text-white">{editing ? t("update") : t("add")} {t("donations").toLowerCase()}</button>
    </form>
    {loading ? <Loading /> : rows.length === 0 ? <EmptyState message={t("noDonations")} /> : <div className="rounded-lg border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="p-3">{t("date")}</th><th>{t("donor")}</th><th>{t("donorCountry")}</th><th>{t("public")}</th><th>{t("amount")}</th><th></th></tr></thead><tbody>{paginatedRows.map((row) => <tr className="border-t" key={row.id}><td className="p-3">{formatDate(row.received_date)}</td><td>{row.donor_name || "-"}</td><td>{row.donor_country || "-"}</td><td>{row.is_public ? row.donor_display_name || t("anonymous") : t("private")}</td><td>{money(row.amount)}</td><td className="space-x-2"><button className="bg-slate-100" onClick={() => { setEditing(row.id); setForm({ donor_name: row.donor_name || "", donor_display_name: row.donor_display_name || "", donor_country: row.donor_country || "", is_public: row.is_public, amount: row.amount, received_date: row.received_date, notes: row.notes || "" }); }}>{t("edit")}</button><button className="bg-red-50 text-red-700" onClick={async () => { await api.delete(`/admin/donations/${row.id}`); await load(); }}>{t("delete")}</button></td></tr>)}</tbody></table></div><div className="px-4 pb-4"><Pagination page={page} total={rows.length} onPageChange={setPage} /></div></div>}
  </section>;
}
