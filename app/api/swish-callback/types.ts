export type SwishPaymentStatus =
  | "PAID"
  | "DECLINED"
  | "ERROR"
  | "CANCELLED";

export type SwishPaymentResponse = {
  id: string;
  payeePaymentReference: string;
  paymentReference: string;
  callbackUrl: string;
  payerAlias: string;
  payeeAlias: string;
  amount: number;
  currency: string;
  message: string;
  status: SwishPaymentStatus;
  dateCreated: string; // ISO 8601
  datePaid: string | null; // ISO 8601 or null if not paid
  errorCode: string | null;
  errorMessage: string | null;
};