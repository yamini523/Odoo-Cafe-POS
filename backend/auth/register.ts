import { api, APIError } from "encore.dev/api";
import bcrypt from "bcryptjs";
import db from "../db";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Registers the first admin account. Fails if any employee already exists.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM employees WHERE email = ${req.email}
    `;
    if (existing) throw APIError.alreadyExists("email already registered");

    const hash = await bcrypt.hash(req.password, 10);
    const row = await db.queryRow<RegisterResponse>`
      INSERT INTO employees (name, email, password_hash, role)
      VALUES (${req.name}, ${req.email}, ${hash}, 'ADMIN')
      RETURNING id, name, email, role
    `;
    return row!;
  }
);
