import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../db";

const jwtSecret = secret("JWTSecret");

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

// Authenticates an employee and returns a JWT token.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const row = await db.queryRow<{
      id: number;
      name: string;
      email: string;
      role: string;
      password_hash: string;
    }>`
      SELECT id, name, email, role, password_hash
      FROM employees
      WHERE email = ${req.email} AND is_active = true
    `;

    if (!row) throw APIError.unauthenticated("invalid credentials");

    const valid = await bcrypt.compare(req.password, row.password_hash);
    if (!valid) throw APIError.unauthenticated("invalid credentials");

    const token = jwt.sign(
      { id: row.id, email: row.email, role: row.role, name: row.name },
      jwtSecret(),
      { expiresIn: "7d" }
    );

    return {
      token,
      user: { id: row.id, name: row.name, email: row.email, role: row.role },
    };
  }
);
