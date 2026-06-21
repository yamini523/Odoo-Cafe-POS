import { api, APIError } from "encore.dev/api";
import db from "../db";

interface UpdateStatusRequest { id: number; status: string; }
interface UpdateStatusResponse { id: number; status: string; }

// Updates the kitchen status of an order (draft → pending → preparing → ready → paid).
export const updateStatus = api<UpdateStatusRequest, UpdateStatusResponse>(
  { expose: true, method: "PUT", path: "/orders/:id/status" },
  async (req) => {
    const row = await db.queryRow<{ id: number; status: string }>`
      UPDATE orders SET status = ${req.status}, updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING id, status
    `;
    if (!row) throw APIError.notFound("order not found");
    return row;
  }
);
