/**
 * Define a estrutura de service.
 */
export interface Service {
  id: number;
  internalName: string;
  serviceName: string;
  costPerQuery: number;
  linkedSource: string;
}

