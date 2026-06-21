import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteRequest { id: number; }
interface DeleteResponse { success: boolean; }

// Deletes a category.
export const deleteCategory = api<DeleteRequest, DeleteResponse>(
  { expose: true, method: "DELETE", path: "/categories/:id" },
  async (req) => {
    const row = await db.queryRow`SELECT id FROM categories WHERE id = ${req.id}`;
    if (!row) throw APIError.notFound("category not found");
    await db.exec`DELETE FROM categories WHERE id = ${req.id}`;
    return { success: true };
  }
);
