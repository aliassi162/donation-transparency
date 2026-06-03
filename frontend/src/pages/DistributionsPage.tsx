import { FormEvent, useEffect, useState } from "react";
import { FieldLabel } from "../components/FormField";
import Pagination, { paginate } from "../components/Pagination";
import { EmptyState, ErrorState, Loading } from "../components/State";
import { api, formatDate, money } from "../lib/api";
import { assistanceTypeLabel, assistanceTypeOptions } from "../lib/assistanceTypes";
import { useI18n } from "../lib/i18n";
import type { Distribution, Household } from "../lib/types";

const blank = { distribution_code: "", household_code: "", amount: "", distribution_date: "", assistance_type: "cash_transfer", notes: "" };

export default function DistributionsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Distribution[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [form, setForm] = useState(blank);
  const [customType, setCustomType] = useState("");
  const [usesCustomType, setUsesCustomType] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => Promise.all([api.get<Distribution[]>("/admin/distributions"), api.get<Household[]>("/admin/households")]).then(([d, h]) => { setRows(d); setHouseholds(h); setPage(1); }).finally(() => setLoading(false));
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const payload = { ...form, assistance_type: usesCustomType ? customType : form.assistance_type };
      if (editing) await api.put(`/admin/distributions/${editing}`, payload);
      else await api.post("/admin/distributions", payload);
      setForm(blank); setCustomType(""); setUsesCustomType(false); setEditing(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : t("saveFailed")); }
  }
  const paginatedRows = paginate(rows, page);

  return <section className="space-y-4">
    <h1 className="text-2xl font-semibold">{t("distributions")}</h1>
    {error && <ErrorState message={error} />}
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block"><FieldLabel required>{t("household")}</FieldLabel><select value={form.household_code} onChange={(e) => setForm({ ...form, household_code: e.target.value })} required><option value="">{t("selectHousehold")}</option>{households.map((h) => <option key={h.id} value={h.household_code}>{h.household_code}</option>)}</select></label>
        <label className="block"><FieldLabel required>{t("amount")}</FieldLabel><input placeholder={t("amount")} type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></label>
        <label className="block"><FieldLabel required>{t("date")}</FieldLabel><input type="date" value={form.distribution_date} onChange={(e) => setForm({ ...form, distribution_date: e.target.value })} required /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><FieldLabel>{t("distributionCode")}</FieldLabel><input placeholder="DIST-0001" value={form.distribution_code} onChange={(e) => setForm({ ...form, distribution_code: e.target.value })} /></label>
        <label className="block"><FieldLabel>{t("assistanceType")}</FieldLabel><select
          value={usesCustomType ? "__custom" : form.assistance_type}
          onChange={(e) => {
            const value = e.target.value;
            setUsesCustomType(value === "__custom");
            setForm({ ...form, assistance_type: value === "__custom" ? "" : value });
          }}
        >
          {assistanceTypeOptions.map((option) => <option key={option.value} value={option.value}>{t(option.labelKey)}</option>)}
          <option value="__custom">{t("assistanceOther")}</option>
        </select></label>
        {usesCustomType && <label className="block"><FieldLabel>{t("customAssistanceType")}</FieldLabel><input placeholder={t("customAssistanceType")} value={customType} onChange={(e) => setCustomType(e.target.value)} /></label>}
      </div>
      <label className="block"><FieldLabel>{t("notes")}</FieldLabel><textarea placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
      <button className="bg-emerald-700 text-white">{editing ? t("update") : t("add")} {t("distributions").toLowerCase()}</button>
    </form>
    {loading ? <Loading /> : rows.length === 0 ? <EmptyState message={t("noDistributions")} /> : <div className="rounded-lg border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="p-3">{t("date")}</th><th>{t("distributionCode")}</th><th>{t("household")}</th><th>{t("location")}</th><th>{t("amount")}</th><th>{t("type")}</th><th>{t("notes")}</th><th></th></tr></thead><tbody>{paginatedRows.map((row) => <tr className="border-t" key={row.id}><td className="p-3">{formatDate(row.distribution_date)}</td><td>{row.distribution_code || "-"}</td><td>{row.household_code}</td><td>{row.location || "-"}</td><td>{money(row.amount)}</td><td>{assistanceTypeLabel(row.assistance_type, t)}</td><td>{row.notes || "-"}</td><td className="space-x-2"><button className="bg-slate-100" onClick={() => { const knownType = assistanceTypeOptions.some((option) => option.value === row.assistance_type); setEditing(row.id); setUsesCustomType(Boolean(row.assistance_type && !knownType)); setCustomType(knownType ? "" : row.assistance_type || ""); setForm({ distribution_code: row.distribution_code || "", household_code: row.household_code, amount: row.amount, distribution_date: row.distribution_date, assistance_type: knownType ? row.assistance_type || "" : "", notes: row.notes || "" }); }}>{t("edit")}</button><button className="bg-red-50 text-red-700" onClick={async () => { await api.delete(`/admin/distributions/${row.id}`); await load(); }}>{t("delete")}</button></td></tr>)}</tbody></table></div><div className="px-4 pb-4"><Pagination page={page} total={rows.length} onPageChange={setPage} /></div></div>}
  </section>;
}
