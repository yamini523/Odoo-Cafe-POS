import { api } from "encore.dev/api";
import db from "../db";
import { Customer } from "./list";

interface CreateRequest { name: string; email?: string; phone?: string; }

// Creates a new customer.
export const create = api<CreateRequest, Customer>(
  { expose: true, method: "POST", path: "/customers" },
  async (req: CreateRequest) => {
    const row = await db.queryRow<Customer>`
      INSERT INTO customers (name, email, phone)
      VALUES (${req.name}, ${req.email ?? null}, ${req.phone ?? null})
      RETURNING id, name, email, phone, created_at
    `;
    return row!;
  }
);
