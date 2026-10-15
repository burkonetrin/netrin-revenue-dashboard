/** Extrai até 11 dígitos numéricos de um telefone brasileiro. */
export const getPhoneDigits = (value: string): string => value.replace(/\D/g, "").slice(0, 11);

/** Aplica máscara de telefone brasileiro para exibição em inputs. */
export const maskBrazilianPhone = (value: string): string => {
  const digits = getPhoneDigits(value);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  const areaCode = digits.slice(0, 2);
  const phone = digits.slice(2);

  if (phone.length <= 4) {
    return `(${areaCode}) ${phone}`;
  }

  if (phone.length <= 8) {
    return `(${areaCode}) ${phone.slice(0, 4)}-${phone.slice(4)}`;
  }

  return `(${areaCode}) ${phone.slice(0, 1)} ${phone.slice(1, 5)}-${phone.slice(5, 9)}`;
};
