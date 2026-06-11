import { DEFAULT_PAYMENT } from "@/lib/site-config";

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
    bankName: process.env.PAYMENT_BANK_NAME?.trim() || DEFAULT_PAYMENT.bankName,
    accountTitle:
      process.env.PAYMENT_ACCOUNT_TITLE?.trim() || DEFAULT_PAYMENT.accountTitle,
    accountNumber:
      process.env.PAYMENT_ACCOUNT_NUMBER?.trim() ||
      DEFAULT_PAYMENT.accountNumber,
    iban: process.env.PAYMENT_IBAN?.trim() || DEFAULT_PAYMENT.iban,
    jazzCash: process.env.PAYMENT_JAZZCASH?.trim() || undefined,
    easyPaisa:
      process.env.PAYMENT_EASYPAISA?.trim() || DEFAULT_PAYMENT.easyPaisa,
    instructions:
      process.env.PAYMENT_INSTRUCTIONS?.trim() ||
      DEFAULT_PAYMENT.instructions,
  };
}
