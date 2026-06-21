import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Order } from "./list";

interface UpdateRequest {
  id: number;
  status?: string;
  payment_method?: string;
  discount?: number;
  notes?: string;
}

// Updates an order's status or payment info.
export const update = api<UpdateRequest, Order>(
  { expose: true, method: "PUT", path: "/orders/:id" },
  async (req) => {
    const existing = await db.queryRow<Order>`SELECT * FROM orders WHERE id = ${req.id}`;
    if (!existing) throw APIError.notFound("order not found");

    const row = await db.queryRow<Order>`
      UPDATE orders
      SET status = ${req.status ?? existing.status},
          payment_method = ${req.payment_method ?? existing.payment_method},
          discount = ${req.discount ?? existing.discount},
          notes = ${req.notes ?? existing.notes},
          updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING id, order_number, session_id, table_id, null as table_number,
                customer_id, null as customer_name, employee_id, null as employee_name,
                status, subtotal, tax_total, discount, total, payment_method, notes, source,
                created_at, updated_at
    `;
    return row!;
  }
);
