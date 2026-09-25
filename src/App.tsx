import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
