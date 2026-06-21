import { api } from "encore.dev/api";
import db from "../db";

export interface RestaurantTable {
  id: number;
  table_number: string;
  floor_id: number | null;
  floor_name: string | null;
  seats: number;
  status: string;
  qr_token: string | null;
  created_at: string;
}

export interface Floor {
  id: number;
  name: string;
}

interface ListResponse { tables: RestaurantTable[]; floors: Floor[]; }

// Lists all restaurant tables with floor info.
export const list = api<void, ListResponse>(
  { expose: true, method: "GET", path: "/tables" },
  async () => {
    const tables = await db.queryAll<RestaurantTable>`
      SELECT t.id, t.table_number, t.floor_id, f.name as floor_name, t.seats, t.status, t.qr_token, t.created_at
      FROM restaurant_tables t
      LEFT JOIN floors f ON t.floor_id = f.id
      ORDER BY t.floor_id, t.table_number
    `;
    const floors = await db.queryAll<Floor>`SELECT id, name FROM floors ORDER BY name`;
    return { tables, floors };
  }
);
