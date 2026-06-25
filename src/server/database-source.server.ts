/**
 * Database data source (server-only) — STUB.
 *
 * This is where you'd plug a real connection (Postgres, MySQL, SQL Server,
 * BigQuery, etc.). Keep credentials in environment variables and access them
 * inside the handler — never at module scope.
 *
 * Example with node-postgres (after `bun add pg`):
 *
 *   import { Pool } from "pg";
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *   const { rows } = await pool.query("SELECT ... FROM vendas");
 *   return rows as SaleRow[];
 */
import type { SaleRow } from "./csv-source.server";

export async function readSalesFromDatabase(): Promise<SaleRow[]> {
  // Placeholder: no DB configured yet.
  // Returning an empty list keeps the UI working until a connection is added.
  return [];
}
