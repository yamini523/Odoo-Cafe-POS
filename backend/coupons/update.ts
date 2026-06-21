import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Coupon } from "./list";

interface UpdateRequest {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount?: number;
  is_active?: boolean;
}

// Updates an existing coupon.
export const update = api<UpdateRequest, Coupon>(
  { expose: true, method: "PUT", path: "/coupons/:id" },
  async (req) => {
    const row = await db.queryRow<Coupon>`
      UPDATE coupons
      SET code = ${req.code}, discount_type = ${req.discount_type},
          discount_value = ${req.discount_value},
          min_order_amount = ${req.min_order_amount ?? 0},
          is_active = ${req.is_active ?? true}
      WHERE id = ${req.id}
      RETURNING id, code, discount_type, discount_value, is_active, min_order_amount, created_at
    `;
    if (!row) throw APIError.notFound("coupon not found");
    return row;
  }
);
