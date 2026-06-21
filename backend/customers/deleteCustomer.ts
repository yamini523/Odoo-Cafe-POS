import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteRequest { id: number; }
interface DeleteResponse { success: boolean; }

// Deletes a customer.
export const deleteCustomer = api<DeleteRequest, DeleteResponse>(
  { expose: true, method: "DELETE", path: "/customers/:id" },
  async (req: DeleteRequest) => {
    const row = await db.queryRow`SELECT id FROM customers WHERE id = ${req.id}`;
    if (!row) throw APIError.notFound("customer not found");
    await db.exec`DELETE FROM customers WHERE id = ${req.id}`;
    return { success: true };
  }
);
