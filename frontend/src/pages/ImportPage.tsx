import { FormEvent, useState } from "react";
import { ErrorState } from "../components/State";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";
import type { ImportPreview } from "../lib/types";

const endpoints = {
  households: "/admin/import/households",
  donations: "/admin/import/donations",
  distributions: "/admin/import/distributions",
  workbook: "/admin/import/workbook",
};

const importInstructions = {
  households: {
    helpKey: "householdImportHelp",
    required: ["household_code"],
    optional: ["location", "private_name", "private_phone", "private_notes", "status"],
    example: "household_code,location,private_name,private_phone,private_notes,status\nHH-0001,Ansar,Sample Family,+961000000,Internal note,active",
  },
  donations: {
    helpKey: "donationImportHelp",
    required: ["amount", "received_date"],
    optional: ["donor_name", "donor_display_name", "donor_country", "is_public", "notes"],
    example: "amount,received_date,donor_name,donor_display_name,donor_country,is_public,notes\n100,2026-06-02,Private Name,Public Name,Australia,true,Thank you",
  },
  distributions: {
    helpKey: "distributionImportHelp",
    required: ["household_code", "amount", "distribution_date"],
    optional: ["distribution_code", "assistance_type", "notes"],
    example: "distribution_code,household_code,amount,distribution_date,assistance_type,notes\nDIST-0001,HH-0001,50,2026-06-03,cash_transfer,Cash transfer support",
  },
  workbook: {
    helpKey: "workbookImportHelp",
    required: ["households sheet", "distributions sheet"],
    optional: ["distribution_code is recommended for each distribution"],
    example: "Sheet: households\nhousehold_code,location,private_name,private_phone,private_notes,status\nHH-0001,Ansar,Sample Family,+961000000,Internal note,active\n\nSheet: distributions\ndistribution_code,household_code,amount,distribution_date,assistance_type,notes\nDIST-0001,HH-0001,50,2026-06-03,cash_transfer,Cash transfer support",
  },
};

export default function ImportPage() {
  const { t } = useI18n();
  const [type, setType] = useState<keyof typeof endpoints>("workbook");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportPreview | null>(null);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    setError(""); setResult(null);
    try { setResult(await api.post<ImportPreview>(endpoints[type], data)); }
    catch (err) { setError(err instanceof Error ? err.message : t("importFailed")); }
  }

  const instructions = importInstructions[type];
  const isWorkbook = type === "workbook";

  return <section className="space-y-4">
    <h1 className="text-2xl font-semibold">{t("dataImport")}</h1>
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
      <select value={type} onChange={(e) => setType(e.target.value as keyof typeof endpoints)}>
        <option value="households">{t("households")}</option>
        <option value="donations">{t("donations")}</option>
        <option value="distributions">{t("distributions")}</option>
        <option value="workbook">{t("excelWorkbook")}</option>
      </select>
      <input
        type="file"
        accept={isWorkbook ? ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : ".csv,text/csv"}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        required
      />
      <button className="bg-emerald-700 text-white">{t("validateImport")}</button>
    </form>
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
      <p>{t(instructions.helpKey)}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="font-semibold text-slate-800">{t("requiredColumns")}</p>
          <p className="mt-1 font-mono text-xs">{instructions.required.join(", ")}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="font-semibold text-slate-800">{t("optionalColumns")}</p>
          <p className="mt-1 font-mono text-xs">{instructions.optional.join(", ")}</p>
        </div>
      </div>
      <div className="rounded-md bg-slate-950 p-3 text-slate-100">
        <p className="mb-2 font-semibold">{isWorkbook ? t("exampleWorkbook") : t("exampleCsv")}</p>
        <pre className="overflow-x-auto whitespace-pre text-xs"><code>{instructions.example}</code></pre>
      </div>
    </div>
    {error && <ErrorState message={error} />}
    {result && <div className={`rounded-lg border p-4 ${result.valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
      <p className="font-medium">{result.valid ? t("importSuccess", { count: result.rows_valid }) : t("importFailure", { count: result.rows_valid })}</p>
      {result.errors.length > 0 && <ul className="mt-3 space-y-1 text-sm text-red-700">{result.errors.map((row) => <li key={row.row}>{t("row")} {row.row}: {row.errors.join(", ")}</li>)}</ul>}
    </div>}
  </section>;
}
