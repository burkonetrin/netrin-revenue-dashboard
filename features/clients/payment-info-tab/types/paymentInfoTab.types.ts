/** Dono do cadastro de pagamento na sidebar (paridade com o Nucleus). */
export type PaymentOwner =
  | { type: "client" }
  | { type: "contract"; contractId: string }
  | { type: "deductible"; contractId: string; deductibleId: string }
  | { type: "group"; groupId: string };