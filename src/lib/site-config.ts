/** Public business & contact details (shown on storefront). */
export const SITE = {
  businessName: "Studio Thirteen",
  email: "studiothirteen.official@gmail.com",
  phone: "0311 4660106",
  phoneWhatsApp: "923114660106",
  address:
    "435A Nasheman e Iqbal, Corporate Housing Society Phase 1, Lahore",
  hours: "Mon–Sat, 10am–7pm",
} as const;

export const DEFAULT_PAYMENT = {
  bankName: "UBL",
  accountTitle: "Muhammad Abdul Moiz (Studio Thirteen)",
  accountNumber: "1937283913284",
  iban: "PK65UNIL0109000283913284",
  easyPaisa: "03379787412",
  instructions:
    "Transfer the exact order total to the account above, then upload your payment screenshot.",
} as const;

export function getWhatsAppUrl(text?: string) {
  const base = `https://wa.me/${SITE.phoneWhatsApp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
