import { CustomersIcon, FinancialIcon } from "@/shared/components/sidebar/icons";
import type { MenuItem } from "@/shared/components/sidebar/menuItems";
import { BILLING_BASE_PATH, PROTOTYPE_BASE_PATH } from "./constants";

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
];
