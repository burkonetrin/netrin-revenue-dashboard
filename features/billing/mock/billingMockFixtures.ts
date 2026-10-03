import type { BillingInvoiceDetail } from "../types/billing-detail.types";

export const clientScopeEntry: BillingInvoiceDetail = {
  id: "bill-005",
  clientId: "client-001",
  clientName: "Netrin",
  profitCenter: "Centro 01",
  competence: "2026-01",
  referenceMonth: "2026-01",
  invoicePeriodMonths: 1,
  totalAmount: 2000,
  invoiceDetails: {
    scope: "client",
    notes: [{ id: "note-007", ownerName: "Netrin", dueDate: "2026-12-12" }],
  },
  contracts: [
    {
      id: "contract-005",
      name: "Contrato Netrin",
      franchises: [
        {
          id: "contract-005-franchise-001",
          billingItemId: "item-contract-005-franchise-001",
          name: "Franquia Padrão (NETRIN)",
          pricingModel: "fixed",
          fixedPrice: 2000,
          consumption: { label: "2.000 de 2.000", sublabel: "R$ 2.000,00" },
          excessAmount: 150,
          excessLabel: "75 consultas: R$ 150,00",
          total: 2150,
        },
      ],
      adjustments: [
        {
          id: "adj-001",
          type: "discount",
          description: "Desconto comercial acordado",
          amount: 200,
        },
        {
          id: "adj-002",
          type: "surcharge",
          description: "Taxa de implantação",
          amount: 50,
        },
      ],
      subtotalWithoutAdjustments: 2150,
      total: 2000,
    },
  ],
  invoiceTotal: 2000,
};

export const clientScopeDueDateInvoice: BillingInvoiceDetail = {
  id: "bill-001",
  clientId: "client-001",
  clientName: "Netrin",
  profitCenter: "Centro 01",
  competence: "2025-12",
  referenceMonth: "2025-12",
  invoicePeriodMonths: 1,
  totalAmount: 1500,
  invoiceDetails: {
    scope: "client",
    notes: [{ id: "note-001", ownerName: "Netrin", dueDate: "2025-10-12" }],
  },
  contracts: [
    {
      id: "contract-001",
      name: "Contrato Principal",
      franchises: [
        {
          id: "contract-001-franchise-fixed",
          billingItemId: "item-contract-001-franchise-fixed",
          name: "Franquia Padrão",
          pricingModel: "fixed",
          fixedPrice: 1500,
          consumption: { label: "1.000 de 1.000", sublabel: "R$ 1.500,00" },
          excessAmount: 0,
          total: 1500,
        },
      ],
      subtotalWithoutAdjustments: 1500,
      total: 1500,
    },
  ],
  invoiceTotal: 1500,
};

export const contractScopeInvoice: BillingInvoiceDetail = {
  id: "bill-003",
  clientId: "client-003",
  clientName: "Banco Pine S/A",
  profitCenter: "Centro 01",
  competence: "2025-12",
  referenceMonth: "2025-12",
  invoicePeriodMonths: 1,
  totalAmount: 3596,
  invoiceDetails: {
    scope: "contract",
    notes: [
      { id: "note-003", ownerName: "Contrato A", dueDate: "2026-12-12" },
      { id: "note-004", ownerName: "Contrato B", dueDate: "2026-12-12" },
    ],
  },
  contracts: [
    {
      id: "contract-003-a",
      name: "Contrato A",
      competence: "2025-12",
      dueDate: "2026-12-12",
      franchises: [
        {
          id: "contract-003-a-franchise-001",
          billingItemId: "item-contract-003-a-franchise-001",
          name: "Franquia Matriz (BANCO PINE)",
          pricingModel: "fixed",
          fixedPrice: 2500,
          consumption: { label: "2.500 de 2.500", sublabel: "R$ 2.500,00" },
          excessAmount: 0,
          total: 2500,
        },
      ],
      subtotalWithoutAdjustments: 2500,
      total: 2500,
    },
    {
      id: "contract-003-b",
      name: "Contrato B",
      competence: "2025-12",
      dueDate: "2026-12-12",
      franchises: [
        {
          id: "contract-003-b-franchise-001",
          billingItemId: "item-contract-003-b-franchise-001",
          name: "Franquia Filial (BANCO PINE)",
          pricingModel: "range_per_query",
          priceRanges: [{ minConsultations: 1, maxConsultations: 1000, unitPrice: 0.1 }],
          consumption: { label: "Faixa 2: 120 de 5.000", sublabel: "R$ 96,00" },
          excessAmount: 96,
          total: 1096,
        },
      ],
      subtotalWithoutAdjustments: 1096,
      total: 1096,
    },
  ],
  invoiceTotal: 3596,
};

export const deductibleScopeInvoice: BillingInvoiceDetail = {
  id: "bill-004",
  clientId: "client-004",
  clientName: "ACHE Laboratorios Farmaceuticos SA",
  profitCenter: "Centro 02",
  competence: "2025-11",
  referenceMonth: "2025-11",
  invoicePeriodMonths: 1,
  totalAmount: 4008,
  invoiceDetails: {
    scope: "deductible",
    notes: [
      { id: "note-005", ownerName: "NOME DA FRANQUIA", dueDate: "2026-12-12" },
      { id: "note-006", ownerName: "Franquia Filial (2ª nota)", dueDate: "2026-12-20" },
    ],
  },
  contracts: [
    {
      id: "contract-004",
      name: "Contrato Único",
      competence: "2025-11",
      franchises: [
        {
          id: "contract-004-franchise-001",
          billingItemId: "item-contract-004-franchise-001",
          name: "NOME DA FRANQUIA",
          pricingModel: "fixed",
          fixedPrice: 3000,
          consumption: { label: "3.000 de 3.000", sublabel: "R$ 3.000,00" },
          excessAmount: 0,
          total: 3000,
          dueDate: "2026-12-12",
        },
        {
          id: "contract-004-franchise-002",
          billingItemId: "item-contract-004-franchise-002",
          name: "Franquia Filial",
          pricingModel: "range_per_query",
          priceRanges: [{ minConsultations: 1, maxConsultations: 1000, unitPrice: 0.1 }],
          consumption: { label: "Faixa 1: 80 de 1.000", sublabel: "R$ 8,00" },
          excessAmount: 8,
          total: 1008,
          dueDate: "2026-12-20",
        },
      ],
      subtotalWithoutAdjustments: 4008,
      total: 4008,
    },
  ],
  invoiceTotal: 4008,
};
