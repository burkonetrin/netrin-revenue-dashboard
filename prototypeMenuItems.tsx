import { CustomersIcon, FinancialIcon, ProvidersIcon, SettingsIcon } from "@/shared/components/sidebar/icons";
import type { MenuItem } from "@/shared/components/sidebar/menuItems";
import {
  BILLING_BASE_PATH,
  BILLING_TASKS_BASE_PATH,
  PROTOTYPE_BASE_PATH,
  PROVIDERS_BASE_PATH,
} from "./constants";

/** Menu lateral do protótipo — painel comercial (aba Clientes fica nas tabs da página). */
export const commercialDashboardPrototypeMenuItems: MenuItem[] = [
  {
    label: "Painel comercial",
    path: PROTOTYPE_BASE_PATH,
    icon: <CustomersIcon />,
  },
  {
    label: "Faturamento",
    path: BILLING_BASE_PATH,
    icon: <FinancialIcon />,
  },
  {
    label: "Fontes e Fornecedores",
    path: PROVIDERS_BASE_PATH,
    icon: <ProvidersIcon />,
  },
  {
    label: "Ferramentas de suporte",
    path: BILLING_TASKS_BASE_PATH,
    icon: <SettingsIcon />,
  },
];
