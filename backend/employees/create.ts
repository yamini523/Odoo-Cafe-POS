import { api, APIError } from "encore.dev/api";
import bcrypt from "bcryptjs";
import db from "../db";
import { Employee } from "./list";

interface CreateRequest {
  name: string;
  email: string;
  role: string;
  password?: string;
}

// Creates a new employee.
export const create = api<CreateRequest, Employee>(
  { expose: true, method: "POST", path: "/employees" },
  async (req) => {
    const existing = await db.queryRow<{ id: number }>`SELECT id FROM employees WHERE email = ${req.email}`;
    if (existing) throw APIError.alreadyExists("email already registered");

    const hash = await bcrypt.hash(req.password ?? "changeme123", 10);
    const row = await db.queryRow<Employee>`
      INSERT INTO employees (name, email, role, password_hash)
      VALUES (${req.name}, ${req.email}, ${req.role}, ${hash})
      RETURNING id, name, email, role, is_active, created_at
    `;
    return row!;
  }
);
