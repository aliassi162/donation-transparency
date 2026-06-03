import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { useI18n } from "../lib/i18n";
import LanguageToggle from "../components/LanguageToggle";

export default function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const token = await api.post<{ access_token: string }>("/auth/login", { email, password });
      setToken(token.access_token);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">{t("adminLogin")}</h1>
          <LanguageToggle />
        </div>
        <div className="mt-5 space-y-3">
          <label className="block text-sm font-medium">{t("email")}<input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="block text-sm font-medium">{t("password")}<input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        </div>
        {error && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button className="mt-5 w-full bg-emerald-700 text-white hover:bg-emerald-800">{t("login")}</button>
      </form>
    </main>
  );
}
