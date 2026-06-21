import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Coupon } from "./list";

interface ValidateRequest { code: string; order_amount: number; }
interface ValidateResponse { coupon: Coupon; discount_amount: number; }

// Validates a coupon code and returns the discount amount.
export const validate = api<ValidateRequest, ValidateResponse>(
  { expose: true, method: "POST", path: "/coupons/validate" },
  async (req) => {
    const coupon = await db.queryRow<Coupon>`
      SELECT id, code, discount_type, discount_value, is_active, min_order_amount, created_at
      FROM coupons WHERE code = ${req.code} AND is_active = true
    `;
    if (!coupon) throw APIError.notFound("coupon not found or inactive");
    if (req.order_amount < coupon.min_order_amount) {
      throw APIError.failedPrecondition(`minimum order amount is ₹${coupon.min_order_amount}`);
    }
    let discount_amount = 0;
    if (coupon.discount_type === 'percentage') {
      discount_amount = (req.order_amount * coupon.discount_value) / 100;
    } else {
      discount_amount = coupon.discount_value;
    }
    return { coupon, discount_amount };
  }
);
