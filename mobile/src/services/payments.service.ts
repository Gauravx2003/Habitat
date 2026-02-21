import { api } from "./api";

export type PaymentCategory =
  | "HOSTEL_FEE"
  | "FINE"
  | "MESS_FEE"
  | "SECURITY_DEPOSIT"
  | "LIBRARY_MEMBERSHIP"
  | "GYM_MEMBERSHIP"
  | "LIBRARY_FINE";

export type PaymentStatus = "PENDING" | "COMPLETED" | "WAIVED" | "FAILED";

export interface Payment {
  id: string;
  residentId: string;
  issuedBy: string | null;
  amount: number;
  category: PaymentCategory;
  description: string | null;
  status: PaymentStatus;
  transactionId: string | null;
  dueDate: string | null;
  paidAt: string | null;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  createdAt: string;
  updatedAt: string | null;
  residentName: string;
  residentRoom: string;
}

export const getMyPayments = async (): Promise<Payment[]> => {
  const response = await api.get("/payments/my-payments");
  return response.data;
};
