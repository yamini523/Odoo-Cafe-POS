import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Product } from "./list";

interface UpdateRequest {
  id: number;
  name: string;
  category_id?: number;
  price: number;
  tax?: number;
  description?: string;
  image_url?: string;
  unit?: string;
  is_available?: boolean;
}

// Updates an existing product.
export const update = api<UpdateRequest, Product>(
  { expose: true, method: "PUT", path: "/products/:id" },
  async (req) => {
    const row = await db.queryRow<Product>`
      UPDATE products
      SET name = ${req.name},
          category_id = ${req.category_id ?? null},
          price = ${req.price},
          tax = ${req.tax ?? 0},
          description = ${req.description ?? null},
          image_url = ${req.image_url ?? null},
          unit = ${req.unit ?? 'pcs'},
          is_available = ${req.is_available ?? true}
      WHERE id = ${req.id}
      RETURNING id, name, category_id, null as category_name, null as category_color,
                price, tax, description, image_url, unit, is_available, created_at
    `;
    if (!row) throw APIError.notFound("product not found");
    return row;
  }
);
