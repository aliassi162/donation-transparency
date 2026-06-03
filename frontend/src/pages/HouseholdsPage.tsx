import { FormEvent, useEffect, useState } from "react";
import { FieldLabel } from "../components/FormField";
import Pagination, { paginate } from "../components/Pagination";
import { EmptyState, ErrorState, Loading } from "../components/State";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";
import type { Household } from "../lib/types";

type HouseholdForm = { household_code: string; location: string; private_name: string; private_phone: string; private_notes: string; status: "active" | "inactive" };
const blank: HouseholdForm = { household_code: "", location: "", private_name: "", private_phone: "", private_notes: "", status: "active" };

export default function HouseholdsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Household[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => api.get<Household[]>("/admin/households").then((nextRows) => { setRows(nextRows); setPage(1); }).finally(() => setLoading(false));
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      if (editing) await api.put(`/admin/households/${editing}`, form);
      else await api.post("/admin/households", form);
      setForm(blank); setEditing(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : t("saveFailed")); }
  }
  const paginatedRows = paginate(rows, page);

  return <section className="space-y-4">
    <h1 className="text-2xl font-semibold">{t("households")}</h1>
    {error && <ErrorState message={error} />}
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block"><FieldLabel required>{t("code")}</FieldLabel><input placeholder="HH-0001" value={form.household_code} onChange={(e) => setForm({ ...form, household_code: e.target.value })} required /></label>
        <label className="block"><FieldLabel>{t("location")}</FieldLabel><input placeholder={t("location")} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
        <label className="block"><FieldLabel>{t("status")}</FieldLabel><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}><option value="active">{t("active")}</option><option value="inactive">{t("inactive")}</option></select></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><FieldLabel>{t("privateName")}</FieldLabel><input placeholder={t("privateName")} value={form.private_name} onChange={(e) => setForm({ ...form, private_name: e.target.value })} /></label>
        <label className="block"><FieldLabel>{t("privatePhone")}</FieldLabel><input placeholder={t("privatePhone")} value={form.private_phone} onChange={(e) => setForm({ ...form, private_phone: e.target.value })} /></label>
      </div>
      <label className="block"><FieldLabel>{t("privateNotes")}</FieldLabel><textarea placeholder={t("privateNotes")} value={form.private_notes} onChange={(e) => setForm({ ...form, private_notes: e.target.value })} /></label>
      <button className="bg-emerald-700 text-white">{editing ? t("update") : t("add")} {t("household")}</button>
    </form>
    {loading ? <Loading /> : rows.length === 0 ? <EmptyState message={t("noHouseholds")} /> : <div className="rounded-lg border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="p-3">{t("code")}</th><th>{t("location")}</th><th>{t("name")}</th><th>{t("phone")}</th><th>{t("status")}</th><th>{t("notes")}</th><th></th></tr></thead><tbody>{paginatedRows.map((row) => <tr className="border-t" key={row.id}><td className="p-3 font-medium">{row.household_code}</td><td>{row.location || "-"}</td><td>{row.private_name || "-"}</td><td>{row.private_phone || "-"}</td><td>{row.status === "active" ? t("active") : t("inactive")}</td><td>{row.private_notes || "-"}</td><td className="space-x-2"><button className="bg-slate-100" onClick={() => { setEditing(row.id); setForm({ household_code: row.household_code, location: row.location || "", private_name: row.private_name || "", private_phone: row.private_phone || "", private_notes: row.private_notes || "", status: row.status }); }}>{t("edit")}</button><button className="bg-red-50 text-red-700" onClick={async () => { await api.delete(`/admin/households/${row.id}`); await load(); }}>{t("delete")}</button></td></tr>)}</tbody></table></div><div className="px-4 pb-4"><Pagination page={page} total={rows.length} onPageChange={setPage} /></div></div>}
  </section>;
}
