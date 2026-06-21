import { api } from "encore.dev/api";
import db from "../db";
import { Category } from "./list";

interface CreateRequest { name: string; color: string; }

// Creates a new category.
export const create = api<CreateRequest, Category>(
  { expose: true, method: "POST", path: "/categories" },
  async (req) => {
    const row = await db.queryRow<Category>`
      INSERT INTO categories (name, color)
      VALUES (${req.name}, ${req.color})
      RETURNING id, name, color, created_at
    `;
    return row!;
  }
);
