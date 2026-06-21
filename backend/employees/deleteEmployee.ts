import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteRequest { id: number; }
interface DeleteResponse { success: boolean; }

// Deletes an employee.
export const deleteEmployee = api<DeleteRequest, DeleteResponse>(
  { expose: true, method: "DELETE", path: "/employees/:id" },
  async (req) => {
    const row = await db.queryRow`SELECT id FROM employees WHERE id = ${req.id}`;
    if (!row) throw APIError.notFound("employee not found");
    await db.exec`DELETE FROM employees WHERE id = ${req.id}`;
    return { success: true };
  }
);
