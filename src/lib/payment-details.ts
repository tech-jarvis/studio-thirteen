export type PaymentAccountDetails = {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  jazzCash?: string;
  easyPaisa?: string;
  instructions: string;
};

export function getPaymentAccountDetails(): PaymentAccountDetails {
  return {
    bankName: process.env.PAYMENT_BANK_NAME?.trim() || "HBL",
    accountTitle: process.env.PAYMENT_ACCOUNT_TITLE?.trim() || "Studio Thirteen",
    accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER?.trim() || "12345678901234",
    iban: process.env.PAYMENT_IBAN?.trim() || "PK00HABB00000000000000",
    jazzCash: process.env.PAYMENT_JAZZCASH?.trim() || undefined,
    easyPaisa: process.env.PAYMENT_EASYPAISA?.trim() || undefined,
    instructions:
      process.env.PAYMENT_INSTRUCTIONS?.trim() ||
      "Transfer the exact order total, then upload your payment screenshot below.",
  };
}
