import { api } from "encore.dev/api";
import db from "../db";

export interface PosSession {
  id: number;
  employee_id: number | null;
  employee_name: string | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
  total_orders: number;
  total_revenue: number;
  cash_total: number;
  upi_total: number;
  card_total: number;
}

interface ListResponse { sessions: PosSession[]; }

// Lists all POS sessions.
export const list = api<void, ListResponse>(
  { expose: true, method: "GET", path: "/sessions" },
  async () => {
    const rows = await db.queryAll<PosSession>`
      SELECT s.id, s.employee_id, e.name as employee_name, s.status,
             s.opened_at, s.closed_at, s.total_orders, s.total_revenue,
             s.cash_total, s.upi_total, s.card_total
      FROM pos_sessions s
      LEFT JOIN employees e ON s.employee_id = e.id
      ORDER BY s.opened_at DESC
    `;
    return { sessions: rows };
  }
);
