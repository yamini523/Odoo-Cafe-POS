import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteRequest { id: number; }
interface DeleteResponse { success: boolean; }

// Deletes an order and its items.
export const deleteOrder = api<DeleteRequest, DeleteResponse>(
  { expose: true, method: "DELETE", path: "/orders/:id" },
  async (req) => {
    const row = await db.queryRow`SELECT id FROM orders WHERE id = ${req.id}`;
    if (!row) throw APIError.notFound("order not found");
    await db.exec`DELETE FROM orders WHERE id = ${req.id}`;
    return { success: true };
  }
);
