import { LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";
import { setToken } from "../lib/api";
import { useI18n } from "../lib/i18n";

const links = [
  ["/admin", "dashboard"],
  ["/admin/donations", "donations"],
  ["/admin/households", "households"],
  ["/admin/distributions", "distributions"],
  ["/admin/import", "import"],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="border-b border-slate-200 bg-white p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t("admin")}</p>
            <h1 className="text-lg font-semibold">{t("transparency")}</h1>
          </div>
          <button
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200"
            onClick={() => {
              setToken(null);
              navigate("/admin/login");
            }}
          >
            <LogOut size={16} /> {t("logout")}
          </button>
        </div>
        <div className="mb-4">
          <LanguageToggle />
        </div>
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/admin"} className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
              {t(label)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
