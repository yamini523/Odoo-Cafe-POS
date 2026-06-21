import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  session_id: number | null;
  table_id: number | null;
  table_number: string | null;
  customer_id: number | null;
  customer_name: string | null;
  employee_id: number | null;
  employee_name: string | null;
  status: string;
  subtotal: number;
  tax_total: number;
  discount: number;
  total: number;
  payment_method: string | null;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

interface ListParams { status?: Query<string>; }
interface ListResponse { orders: Order[]; }

// Lists all orders with optional status filter.
export const list = api<ListParams, ListResponse>(
  { expose: true, method: "GET", path: "/orders" },
  async (req) => {
    let rows: Order[];
    if (req.status) {
      rows = await db.queryAll<Order>`
        SELECT o.id, o.order_number, o.session_id, o.table_id, rt.table_number,
               o.customer_id, c.name as customer_name, o.employee_id, e.name as employee_name,
               o.status, o.subtotal, o.tax_total, o.discount, o.total,
               o.payment_method, o.notes, o.source, o.created_at, o.updated_at
        FROM orders o
        LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN employees e ON o.employee_id = e.id
        WHERE o.status = ${req.status}
        ORDER BY o.created_at DESC
      `;
    } else {
      rows = await db.queryAll<Order>`
        SELECT o.id, o.order_number, o.session_id, o.table_id, rt.table_number,
               o.customer_id, c.name as customer_name, o.employee_id, e.name as employee_name,
               o.status, o.subtotal, o.tax_total, o.discount, o.total,
               o.payment_method, o.notes, o.source, o.created_at, o.updated_at
        FROM orders o
        LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN employees e ON o.employee_id = e.id
        ORDER BY o.created_at DESC
        LIMIT 200
      `;
    }
    return { orders: rows };
  }
);
