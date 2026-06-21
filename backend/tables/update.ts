import { api, APIError } from "encore.dev/api";
import db from "../db";
import { RestaurantTable } from "./list";

interface UpdateRequest {
  id: number;
  table_number: string;
  floor_id?: number;
  seats?: number;
  status?: string;
}

// Updates a restaurant table.
export const update = api<UpdateRequest, RestaurantTable>(
  { expose: true, method: "PUT", path: "/tables/:id" },
  async (req) => {
    const row = await db.queryRow<RestaurantTable>`
      UPDATE restaurant_tables
      SET table_number = ${req.table_number},
          floor_id = ${req.floor_id ?? null},
          seats = ${req.seats ?? 4},
          status = ${req.status ?? 'available'}
      WHERE id = ${req.id}
      RETURNING id, table_number, floor_id, null as floor_name, seats, status, qr_token, created_at
    `;
    if (!row) throw APIError.notFound("table not found");
    return row;
  }
);
