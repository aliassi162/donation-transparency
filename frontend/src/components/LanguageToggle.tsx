import { useI18n } from "../lib/i18n";

export default function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();
  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
      <span>{t("language")}</span>
      <select className="w-auto py-1" value={language} onChange={(event) => setLanguage(event.target.value === "ar" ? "ar" : "en")}>
        <option value="en">{t("english")}</option>
        <option value="ar">{t("arabic")}</option>
      </select>
    </label>
  );
}
