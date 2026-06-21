import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface Product {
  id: number;
  name: string;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  price: number;
  tax: number;
  description: string | null;
  image_url: string | null;
  unit: string;
  is_available: boolean;
  created_at: string;
}

interface ListParams { category_id?: Query<number>; }
interface ListResponse { products: Product[]; }

// Lists all products with optional category filter.
export const list = api<ListParams, ListResponse>(
  { expose: true, method: "GET", path: "/products" },
  async (req) => {
    let rows: Product[];
    if (req.category_id) {
      rows = await db.queryAll<Product>`
        SELECT p.id, p.name, p.category_id, c.name as category_name, c.color as category_color,
               p.price, p.tax, p.description, p.image_url, p.unit, p.is_available, p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ${req.category_id}
        ORDER BY p.name ASC
      `;
    } else {
      rows = await db.queryAll<Product>`
        SELECT p.id, p.name, p.category_id, c.name as category_name, c.color as category_color,
               p.price, p.tax, p.description, p.image_url, p.unit, p.is_available, p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.name ASC
      `;
    }
    return { products: rows };
  }
);
