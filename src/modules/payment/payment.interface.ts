export interface ICreatePayment {
  amount: number;
  currency?: string;
}

export interface IGetPaymentsQuery {
  page?: number;
  limit?: number;
  status?: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
}