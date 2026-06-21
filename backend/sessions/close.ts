import { api, APIError } from "encore.dev/api";
import db from "../db";
import { PosSession } from "./list";

interface CloseRequest { id: number; }

// Closes a POS session and computes the session summary.
export const close = api<CloseRequest, PosSession>(
  { expose: true, method: "PUT", path: "/sessions/:id/close" },
  async (req) => {
    const session = await db.queryRow`SELECT id, status FROM pos_sessions WHERE id = ${req.id}`;
    if (!session) throw APIError.notFound("session not found");
    if (session.status === 'CLOSED') throw APIError.failedPrecondition("session already closed");

    const summary = await db.queryRow<{
      total_orders: number;
      total_revenue: number;
      cash_total: number;
      card_total: number;
      upi_total: number;
    }>`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END), 0) as cash_total,
        COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END), 0) as card_total,
        COALESCE(SUM(CASE WHEN payment_method = 'upi' THEN total ELSE 0 END), 0) as upi_total
      FROM orders WHERE session_id = ${req.id} AND status = 'paid'
    `;

    const row = await db.queryRow<PosSession>`
      UPDATE pos_sessions
      SET status = 'CLOSED', closed_at = NOW(),
          total_orders = ${Number(summary?.total_orders ?? 0)},
          total_revenue = ${Number(summary?.total_revenue ?? 0)},
          cash_total = ${Number(summary?.cash_total ?? 0)},
          card_total = ${Number(summary?.card_total ?? 0)},
          upi_total = ${Number(summary?.upi_total ?? 0)}
      WHERE id = ${req.id}
      RETURNING id, employee_id, null as employee_name, status, opened_at, closed_at,
                total_orders, total_revenue, cash_total, upi_total, card_total
    `;
    return row!;
  }
);
