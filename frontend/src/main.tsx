import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import AdminLayout from "./components/AdminLayout";
import { getToken } from "./lib/api";
import AdminDashboard from "./pages/AdminDashboard";
import DonationsPage from "./pages/DonationsPage";
import DistributionsPage from "./pages/DistributionsPage";
import HouseholdsPage from "./pages/HouseholdsPage";
import ImportPage from "./pages/ImportPage";
import LoginPage from "./pages/LoginPage";
import PublicDashboard from "./pages/PublicDashboard";
import { I18nProvider } from "./lib/i18n";
import "./index.css";

function Protected({ children }: { children: React.ReactNode }) {
  return getToken() ? children : <Navigate to="/admin/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<PublicDashboard />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<Protected><AdminLayout /></Protected>}>
              <Route index element={<AdminDashboard />} />
              <Route path="donations" element={<DonationsPage />} />
              <Route path="households" element={<HouseholdsPage />} />
              <Route path="distributions" element={<DistributionsPage />} />
              <Route path="import" element={<ImportPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>
);
