import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteRequest { id: number; }
interface DeleteResponse { success: boolean; }

// Deletes a restaurant table.
export const deleteTable = api<DeleteRequest, DeleteResponse>(
  { expose: true, method: "DELETE", path: "/tables/:id" },
  async (req) => {
    const row = await db.queryRow`SELECT id FROM restaurant_tables WHERE id = ${req.id}`;
    if (!row) throw APIError.notFound("table not found");
    await db.exec`DELETE FROM restaurant_tables WHERE id = ${req.id}`;
    return { success: true };
  }
);
