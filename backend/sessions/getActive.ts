import { api } from "encore.dev/api";
import db from "../db";
import { PosSession } from "./list";

interface GetActiveResponse { session: PosSession | null; }

// Retrieves the currently active POS session.
export const getActive = api<void, GetActiveResponse>(
  { expose: true, method: "GET", path: "/sessions/active" },
  async () => {
    const row = await db.queryRow<PosSession>`
      SELECT s.id, s.employee_id, e.name as employee_name, s.status,
             s.opened_at, s.closed_at, s.total_orders, s.total_revenue,
             s.cash_total, s.upi_total, s.card_total
      FROM pos_sessions s
      LEFT JOIN employees e ON s.employee_id = e.id
      WHERE s.status = 'OPEN'
      ORDER BY s.opened_at DESC
      LIMIT 1
    `;
    return { session: row ?? null };
  }
);
