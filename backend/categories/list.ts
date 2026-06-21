import { api } from "encore.dev/api";
import db from "../db";

export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

interface ListResponse { categories: Category[]; }

// Lists all categories.
export const list = api<void, ListResponse>(
  { expose: true, method: "GET", path: "/categories" },
  async () => {
    const rows = await db.queryAll<Category>`
      SELECT id, name, color, created_at FROM categories ORDER BY name ASC
    `;
    return { categories: rows };
  }
);
