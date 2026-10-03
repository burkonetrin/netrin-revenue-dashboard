import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { BillingDetailPage } from "@/components/BillingDetailPage";
import { BillingListPage } from "@/components/BillingListPage";
import { CommercialClientDetailPage } from "@/components/CommercialClientDetailPage";
import { CommercialClientsPage } from "@/components/CommercialClientsPage";
import { CommercialDashboardPage } from "@/components/CommercialDashboardPage";
import { CommercialPrototypeShell } from "@/components/CommercialPrototypeShell";
import { PROTOTYPE_BASE_PATH } from "@/constants";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={PROTOTYPE_BASE_PATH} replace />}
        />
        <Route path={PROTOTYPE_BASE_PATH} element={<CommercialPrototypeShell />}>
          <Route index element={<CommercialDashboardPage />} />
          <Route path="clientes" element={<CommercialClientsPage />} />
          <Route path="clientes/:clientId" element={<CommercialClientDetailPage />} />
          <Route path="faturamento" element={<BillingListPage />} />
          <Route path="faturamento/:id" element={<BillingDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
