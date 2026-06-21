import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Order, OrderItem } from "./list";

interface GetRequest { id: number; }

// Retrieves a single order with its items.
export const getOrder = api<GetRequest, Order>(
  { expose: true, method: "GET", path: "/orders/:id" },
  async (req) => {
    const row = await db.queryRow<Order>`
      SELECT o.id, o.order_number, o.session_id, o.table_id, rt.table_number,
             o.customer_id, c.name as customer_name, o.employee_id, e.name as employee_name,
             o.status, o.subtotal, o.tax_total, o.discount, o.total,
             o.payment_method, o.notes, o.source, o.created_at, o.updated_at
      FROM orders o
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN employees e ON o.employee_id = e.id
      WHERE o.id = ${req.id}
    `;
    if (!row) throw APIError.notFound("order not found");

    const items = await db.queryAll<OrderItem>`
      SELECT id, product_id, product_name, quantity, unit_price, tax, subtotal
      FROM order_items WHERE order_id = ${req.id}
    `;
    row.items = items;
    return row;
  }
);
