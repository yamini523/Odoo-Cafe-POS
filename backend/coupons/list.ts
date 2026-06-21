import { api } from "encore.dev/api";
import db from "../db";

export interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  min_order_amount: number;
  created_at: string;
}

interface ListResponse { coupons: Coupon[]; }

// Lists all coupons.
export const list = api<void, ListResponse>(
  { expose: true, method: "GET", path: "/coupons" },
  async () => {
    const rows = await db.queryAll<Coupon>`
      SELECT id, code, discount_type, discount_value, is_active, min_order_amount, created_at
      FROM coupons ORDER BY created_at DESC
    `;
    return { coupons: rows };
  }
);
