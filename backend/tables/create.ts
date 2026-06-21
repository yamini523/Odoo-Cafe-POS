import { api } from "encore.dev/api";
import db from "../db";
import { RestaurantTable } from "./list";

interface CreateRequest {
  table_number: string;
  floor_id?: number;
  seats?: number;
}

// Creates a new restaurant table.
export const create = api<CreateRequest, RestaurantTable>(
  { expose: true, method: "POST", path: "/tables" },
  async (req) => {
    const qrToken = crypto.randomUUID();
    const row = await db.queryRow<RestaurantTable>`
      INSERT INTO restaurant_tables (table_number, floor_id, seats, qr_token)
      VALUES (${req.table_number}, ${req.floor_id ?? null}, ${req.seats ?? 4}, ${qrToken})
      RETURNING id, table_number, floor_id, null as floor_name, seats, status, qr_token, created_at
    `;
    return row!;
  }
);
