import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Coupon } from "./list";

interface CreateRequest {
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount?: number;
  is_active?: boolean;
}

// Creates a new coupon.
export const create = api<CreateRequest, Coupon>(
  { expose: true, method: "POST", path: "/coupons" },
  async (req) => {
    const existing = await db.queryRow`SELECT id FROM coupons WHERE code = ${req.code}`;
    if (existing) throw APIError.alreadyExists("coupon code already exists");

    const row = await db.queryRow<Coupon>`
      INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active)
      VALUES (${req.code}, ${req.discount_type}, ${req.discount_value},
              ${req.min_order_amount ?? 0}, ${req.is_active ?? true})
      RETURNING id, code, discount_type, discount_value, is_active, min_order_amount, created_at
    `;
    return row!;
  }
);
