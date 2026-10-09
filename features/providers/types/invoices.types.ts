/**
 * Define a estrutura de sub item.
 */
export interface SubItem {
  type: string;
  billedQuantity?: number;
  revenue?: number;
  queries?: number;
  franchise?: string;
}

/**
 * Define a estrutura de consulted service.
 */
export interface ConsultedService {
  id: string;
  name: string;
  revenue: number;
  queries: number;
  revenuePerUnit: number;
  cost: number;
  costQueries: number;
  costPerUnit: number;
  subItems?: SubItem[];
}

/**
 * Define a estrutura de invoice.
 */
export interface Invoice {
  id: number;
  period: string;
  provider: string;
  invoice: number;
  queryCount: number;
  unitCostCalc: number;
  generatedRevenue: number;
  directMargin: number;
  margin: string;
  queryCount2: number;
  unbilledQueries: number;
  totalCache: number;
  initialPeriod: string;
  finalPeriod: string;
  issueDate: string;
  dueDate: string;
  referenceMonth: string;
  paymentMethod: string;
  file?: string;
  consumption: string[];
  observations: string;
  consultedServices: ConsultedService[];
}

