import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Category } from "./list";

interface UpdateRequest { id: number; name: string; color: string; }

// Updates an existing category.
export const update = api<UpdateRequest, Category>(
  { expose: true, method: "PUT", path: "/categories/:id" },
  async (req) => {
    const row = await db.queryRow<Category>`
      UPDATE categories SET name = ${req.name}, color = ${req.color}
      WHERE id = ${req.id}
      RETURNING id, name, color, created_at
    `;
    if (!row) throw APIError.notFound("category not found");
    return row;
  }
);
