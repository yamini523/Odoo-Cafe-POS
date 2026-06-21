import { api, APIError } from "encore.dev/api";
import db from "../db";
import { PaymentMethod } from "./list";

interface UpdateRequest {
  id: number;
  is_enabled: boolean;
  upi_id?: string;
}

// Updates a payment method's enabled status and UPI ID.
export const update = api<UpdateRequest, PaymentMethod>(
  { expose: true, method: "PUT", path: "/payment-methods/:id" },
  async (req) => {
    const row = await db.queryRow<PaymentMethod>`
      UPDATE payment_methods
      SET is_enabled = ${req.is_enabled}, upi_id = ${req.upi_id ?? null}
      WHERE id = ${req.id}
      RETURNING id, name, type, is_enabled, upi_id, created_at
    `;
    if (!row) throw APIError.notFound("payment method not found");
    return row;
  }
);
