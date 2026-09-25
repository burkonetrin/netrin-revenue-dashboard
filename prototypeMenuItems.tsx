import { CustomersIcon } from "@/shared/components/sidebar/icons";
import type { MenuItem } from "@/shared/components/sidebar/menuItems";
import { PROTOTYPE_BASE_PATH } from "./constants";

/** Menu lateral do protótipo — apenas dashboard de clientes. */
export const commercialDashboardPrototypeMenuItems: MenuItem[] = [
  {
    label: "Clientes",
    path: PROTOTYPE_BASE_PATH,
    icon: <CustomersIcon />,
  },
];
