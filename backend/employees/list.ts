import { api } from "encore.dev/api";
import db from "../db";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface ListResponse { employees: Employee[]; }

// Lists all employees.
export const list = api<void, ListResponse>(
  { expose: true, method: "GET", path: "/employees" },
  async () => {
    const rows = await db.queryAll<Employee>`
      SELECT id, name, email, role, is_active, created_at
      FROM employees
      ORDER BY created_at DESC
    `;
    return { employees: rows };
  }
);
