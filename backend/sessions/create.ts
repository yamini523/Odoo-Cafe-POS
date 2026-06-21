import { api } from "encore.dev/api";
import db from "../db";
import { PosSession } from "./list";

interface CreateRequest { employee_id?: number; }

// Opens a new POS session.
export const create = api<CreateRequest, PosSession>(
  { expose: true, method: "POST", path: "/sessions" },
  async (req) => {
    const row = await db.queryRow<PosSession>`
      INSERT INTO pos_sessions (employee_id)
      VALUES (${req.employee_id ?? null})
      RETURNING id, employee_id, null as employee_name, status, opened_at, closed_at,
                total_orders, total_revenue, cash_total, upi_total, card_total
    `;
    return row!;
  }
);
