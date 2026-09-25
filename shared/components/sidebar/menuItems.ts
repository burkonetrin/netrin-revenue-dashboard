import type React from "react";

export interface MenuItem {
  label: string;
  path: string;
  permission?: string;
  productKey?: string;
  icon?: React.ReactNode;
}
