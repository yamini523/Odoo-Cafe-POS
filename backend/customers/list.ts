import { api } from "encore.dev/api";
import db from "../db";

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface ListResponse { customers: Customer[]; }

// Lists all customers.
export const list = api<void, ListResponse>(
  { expose: true, method: "GET", path: "/customers" },
  async () => {
    const rows = await db.queryAll<Customer>`
      SELECT id, name, email, phone, created_at FROM customers ORDER BY name ASC
    `;
    return { customers: rows };
  }
);
