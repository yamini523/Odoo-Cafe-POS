import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface SalesRecord {
  id: number;
  order_number: string;
  table_number: string | null;
  customer_name: string | null;
  employee_name: string | null;
  status: string;
  total: number;
  payment_method: string | null;
  created_at: string;
}

interface SalesParams { from?: Query<string>; to?: Query<string>; }
interface SalesResponse { sales: SalesRecord[]; total_revenue: number; total_orders: number; }

// Returns sales records filtered by date range.
export const sales = api<SalesParams, SalesResponse>(
  { expose: true, method: "GET", path: "/reports/sales" },
  async (req) => {
    const from = req.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = req.to ?? new Date().toISOString().split('T')[0];

    const rows = await db.queryAll<SalesRecord>`
      SELECT o.id, o.order_number, rt.table_number,
             c.name as customer_name, e.name as employee_name,
             o.status, o.total, o.payment_method, o.created_at
      FROM orders o
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN employees e ON o.employee_id = e.id
      WHERE o.created_at >= ${from}::date AND o.created_at < (${to}::date + INTERVAL '1 day')
        AND o.status = 'paid'
      ORDER BY o.created_at DESC
    `;

    const agg = await db.queryRow<{ total_revenue: number; total_orders: number }>`
      SELECT COALESCE(SUM(total), 0) as total_revenue, COUNT(*) as total_orders
      FROM orders
      WHERE created_at >= ${from}::date AND created_at < (${to}::date + INTERVAL '1 day')
        AND status = 'paid'
    `;

    return {
      sales: rows,
      total_revenue: Number(agg?.total_revenue ?? 0),
      total_orders: Number(agg?.total_orders ?? 0),
    };
  }
);
