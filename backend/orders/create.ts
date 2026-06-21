import { api } from "encore.dev/api";
import db from "../db";
import { Order } from "./list";

interface CreateOrderItem {
  product_id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax?: number;
}

interface CreateRequest {
  session_id?: number;
  table_id?: number;
  customer_id?: number;
  employee_id?: number;
  items: CreateOrderItem[];
  discount?: number;
  coupon_id?: number;
  notes?: string;
  payment_method?: string;
  source?: string;
}

// Creates a new order with its items.
export const create = api<CreateRequest, Order>(
  { expose: true, method: "POST", path: "/orders" },
  async (req) => {
    let subtotal = 0;
    let taxTotal = 0;
    for (const item of req.items) {
      const itemSubtotal = item.unit_price * item.quantity;
      subtotal += itemSubtotal;
      taxTotal += (itemSubtotal * (item.tax ?? 0)) / 100;
    }
    const discount = req.discount ?? 0;
    const total = subtotal + taxTotal - discount;

    const countRow = await db.queryRow<{ cnt: number }>`SELECT COUNT(*) as cnt FROM orders`;
    const nextNum = (Number(countRow?.cnt ?? 0) + 1).toString().padStart(3, '0');
    const orderNumber = `ORD-${nextNum}`;

    const order = await db.queryRow<Order>`
      INSERT INTO orders (order_number, session_id, table_id, customer_id, employee_id,
                          status, subtotal, tax_total, discount, total, payment_method,
                          coupon_id, notes, source)
      VALUES (
        ${orderNumber}, ${req.session_id ?? null}, ${req.table_id ?? null},
        ${req.customer_id ?? null}, ${req.employee_id ?? null},
        ${req.payment_method ? 'paid' : 'pending'},
        ${subtotal}, ${taxTotal}, ${discount}, ${total},
        ${req.payment_method ?? null}, ${req.coupon_id ?? null},
        ${req.notes ?? null}, ${req.source ?? 'POS'}
      )
      RETURNING id, order_number, session_id, table_id, null as table_number,
                customer_id, null as customer_name, employee_id, null as employee_name,
                status, subtotal, tax_total, discount, total, payment_method, notes, source,
                created_at, updated_at
    `;

    for (const item of req.items) {
      const itemSubtotal = item.unit_price * item.quantity;
      await db.exec`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, tax, subtotal)
        VALUES (${order!.id}, ${item.product_id ?? null}, ${item.product_name},
                ${item.quantity}, ${item.unit_price}, ${item.tax ?? 0}, ${itemSubtotal})
      `;
    }

    if (req.table_id && req.payment_method) {
      await db.exec`UPDATE restaurant_tables SET status = 'available' WHERE id = ${req.table_id}`;
    } else if (req.table_id) {
      await db.exec`UPDATE restaurant_tables SET status = 'occupied' WHERE id = ${req.table_id}`;
    }

    return order!;
  }
);
