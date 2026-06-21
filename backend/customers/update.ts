import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Customer } from "./list";

interface UpdateRequest { id: number; name: string; email?: string; phone?: string; }

// Updates a customer.
export const update = api<UpdateRequest, Customer>(
  { expose: true, method: "PUT", path: "/customers/:id" },
  async (req) => {
    const row = await db.queryRow<Customer>`
      UPDATE customers SET name = ${req.name}, email = ${req.email ?? null}, phone = ${req.phone ?? null}
      WHERE id = ${req.id}
      RETURNING id, name, email, phone, created_at
    `;
    if (!row) throw APIError.notFound("customer not found");
    return row;
  }
);
