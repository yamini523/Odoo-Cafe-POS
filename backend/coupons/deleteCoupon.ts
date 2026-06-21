import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteRequest { id: number; }
interface DeleteResponse { success: boolean; }

// Deletes a coupon.
export const deleteCoupon = api<DeleteRequest, DeleteResponse>(
  { expose: true, method: "DELETE", path: "/coupons/:id" },
  async (req) => {
    const row = await db.queryRow`SELECT id FROM coupons WHERE id = ${req.id}`;
    if (!row) throw APIError.notFound("coupon not found");
    await db.exec`DELETE FROM coupons WHERE id = ${req.id}`;
    return { success: true };
  }
);
