import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Employee } from "./list";

interface UpdateRequest {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

// Updates an existing employee.
export const update = api<UpdateRequest, Employee>(
  { expose: true, method: "PUT", path: "/employees/:id" },
  async (req) => {
    const row = await db.queryRow<Employee>`
      UPDATE employees
      SET name = ${req.name}, email = ${req.email}, role = ${req.role}, is_active = ${req.is_active}
      WHERE id = ${req.id}
      RETURNING id, name, email, role, is_active, created_at
    `;
    if (!row) throw APIError.notFound("employee not found");
    return row;
  }
);
