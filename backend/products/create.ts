import { api } from "encore.dev/api";
import db from "../db";
import { Product } from "./list";

interface CreateRequest {
  name: string;
  category_id?: number;
  price: number;
  tax?: number;
  description?: string;
  image_url?: string;
  unit?: string;
  is_available?: boolean;
}

// Creates a new product.
export const create = api<CreateRequest, Product>(
  { expose: true, method: "POST", path: "/products" },
  async (req) => {
    const row = await db.queryRow<Product>`
      INSERT INTO products (name, category_id, price, tax, description, image_url, unit, is_available)
      VALUES (
        ${req.name},
        ${req.category_id ?? null},
        ${req.price},
        ${req.tax ?? 0},
        ${req.description ?? null},
        ${req.image_url ?? null},
        ${req.unit ?? 'pcs'},
        ${req.is_available ?? true}
      )
      RETURNING id, name, category_id, null as category_name, null as category_color,
                price, tax, description, image_url, unit, is_available, created_at
    `;
    return row!;
  }
);
