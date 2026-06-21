import { api } from "encore.dev/api";
import db from "../db";

interface DashboardMetrics {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  active_tables: number;
  employees_count: number;
  today_orders: number;
  today_revenue: number;
  sales_trend: SalesTrend[];
  top_products: TopProduct[];
  top_categories: TopCategory[];
  payment_breakdown: PaymentBreakdown[];
}

interface SalesTrend { date: string; revenue: number; orders: number; }
interface TopProduct { name: string; quantity: number; revenue: number; }
interface TopCategory { name: string; revenue: number; }
interface PaymentBreakdown { method: string; total: number; count: number; }

// Returns dashboard analytics metrics including sales trends, top products, and payment breakdowns.
export const dashboard = api<void, DashboardMetrics>(
  { expose: true, method: "GET", path: "/reports/dashboard" },
  async () => {
    const totals = await db.queryRow<{ total_orders: number; total_revenue: number; avg_order_value: number }>`
      SELECT COUNT(*) as total_orders,
             COALESCE(SUM(total), 0) as total_revenue,
             COALESCE(AVG(total), 0) as avg_order_value
      FROM orders WHERE status = 'paid'
    `;

    const todayTotals = await db.queryRow<{ today_orders: number; today_revenue: number }>`
      SELECT COUNT(*) as today_orders,
             COALESCE(SUM(total), 0) as today_revenue
      FROM orders WHERE status = 'paid' AND created_at >= CURRENT_DATE
    `;

    const activeTables = await db.queryRow<{ active_tables: number }>`
      SELECT COUNT(*) as active_tables FROM restaurant_tables WHERE status = 'occupied'
    `;

    const employeesCount = await db.queryRow<{ employees_count: number }>`
      SELECT COUNT(*) as employees_count FROM employees WHERE is_active = true
    `;

    const salesTrend = await db.queryAll<SalesTrend>`
      SELECT TO_CHAR(DATE_TRUNC('day', created_at), 'Mon DD') as date,
             COALESCE(SUM(total), 0) as revenue,
             COUNT(*) as orders
      FROM orders
      WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at)
    `;

    const topProducts = await db.queryAll<TopProduct>`
      SELECT oi.product_name as name,
             SUM(oi.quantity) as quantity,
             SUM(oi.subtotal) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
      GROUP BY oi.product_name
      ORDER BY revenue DESC
      LIMIT 5
    `;

    const topCategories = await db.queryAll<TopCategory>`
      SELECT c.name, COALESCE(SUM(oi.subtotal), 0) as revenue
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'paid'
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT 5
    `;

    const paymentBreakdown = await db.queryAll<PaymentBreakdown>`
      SELECT COALESCE(payment_method, 'unknown') as method,
             COALESCE(SUM(total), 0) as total,
             COUNT(*) as count
      FROM orders
      WHERE status = 'paid' AND payment_method IS NOT NULL
      GROUP BY payment_method
    `;

    return {
      total_orders: Number(totals?.total_orders ?? 0),
      total_revenue: Number(totals?.total_revenue ?? 0),
      avg_order_value: Number(totals?.avg_order_value ?? 0),
      active_tables: Number(activeTables?.active_tables ?? 0),
      employees_count: Number(employeesCount?.employees_count ?? 0),
      today_orders: Number(todayTotals?.today_orders ?? 0),
      today_revenue: Number(todayTotals?.today_revenue ?? 0),
      sales_trend: salesTrend,
      top_products: topProducts,
      top_categories: topCategories,
      payment_breakdown: paymentBreakdown,
    };
  }
);
