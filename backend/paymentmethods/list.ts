import { api } from "encore.dev/api";
import db from "../db";

export interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  is_enabled: boolean;
  upi_id: string | null;
  created_at: string;
}

interface ListResponse { payment_methods: PaymentMethod[]; }

// Lists all payment methods.
export const list = api<void, ListResponse>(
  { expose: true, method: "GET", path: "/payment-methods" },
  async () => {
    const rows = await db.queryAll<PaymentMethod>`
      SELECT id, name, type, is_enabled, upi_id, created_at
      FROM payment_methods ORDER BY id
    `;
    return { payment_methods: rows };
  }
);
