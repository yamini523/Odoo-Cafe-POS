import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteRequest { id: number; }
interface DeleteResponse { success: boolean; }

// Deletes a product.
export const deleteProduct = api<DeleteRequest, DeleteResponse>(
  { expose: true, method: "DELETE", path: "/products/:id" },
  async (req) => {
    const row = await db.queryRow`SELECT id FROM products WHERE id = ${req.id}`;
    if (!row) throw APIError.notFound("product not found");
    await db.exec`DELETE FROM products WHERE id = ${req.id}`;
    return { success: true };
  }
);
