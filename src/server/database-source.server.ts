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
import type { InventoryMovementRow } from "./csv-source.server";

export async function readInventoryFromDatabase(): Promise<InventoryMovementRow[]> {
  const dbUrl = process.env.DATABASE_URL;
  const dbConnStr = process.env.DB_CONNECTION_STRING;

  if (!dbUrl && !dbConnStr) {
    // No database configured. Return empty array, which will make the UI fall back
    // or notify the user to configure variables.
    return [];
  }

  try {
    // 1. PostgreSQL Support
    if (dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
      const pg = await import("pg");
      const pool = new pg.default.Pool({ connectionString: dbUrl });
      const { rows } = await pool.query(`
        SELECT 
          key_centro, nome_centro, empresa, nome_empreendimento,
          cod_insumo, cod_sub_grupo, descricao_insumo, unidade,
          TO_CHAR(data_movimento, 'YYYY-MM-DD') as data_movimento,
          classe, tipo_movimento, tipo_documento, numero_documento,
          num_movimento, quantidade, preco_unitario, valor,
          titulo_grupo, titulo_subgrupo, quantidade_estoque_atual, valor_estoque_atual
        FROM vw_fact_movimentacao_estoque
        ORDER BY data_movimento ASC
      `);
      await pool.end();
      return rows.map((r) => ({
        ...r,
        num_movimento: Number(r.num_movimento || 0),
        quantidade: Number(r.quantidade || 0),
        preco_unitario: Number(r.preco_unitario || 0),
        valor: Number(r.valor || 0),
        quantidade_estoque_atual: Number(r.quantidade_estoque_atual || 0),
        valor_estoque_atual: Number(r.valor_estoque_atual || 0),
      })) as InventoryMovementRow[];
    }

    // 2. SQL Server Support (Alternative connection string)
    if (dbConnStr || (dbUrl && dbUrl.includes("sqlserver"))) {
      const mssql = await import("mssql");
      const pool = await mssql.default.connect(dbConnStr || dbUrl || "");
      const { recordset } = await pool.request().query(`
        SELECT 
          key_centro, nome_centro, empresa, nome_empreendimento,
          cod_insumo, cod_sub_grupo, descricao_insumo, unidade,
          CONVERT(VARCHAR(10), data_movimento, 120) as data_movimento,
          classe, tipo_movimento, tipo_documento, numero_documento,
          num_movimento, quantidade, preco_unitario, valor,
          titulo_grupo, titulo_subgrupo, quantidade_estoque_atual, valor_estoque_atual
        FROM vw_fact_movimentacao_estoque
        ORDER BY data_movimento ASC
      `);
      await pool.close();
      return recordset.map((r) => ({
        ...r,
        num_movimento: Number(r.num_movimento || 0),
        quantidade: Number(r.quantidade || 0),
        preco_unitario: Number(r.preco_unitario || 0),
        valor: Number(r.valor || 0),
        quantidade_estoque_atual: Number(r.quantidade_estoque_atual || 0),
        valor_estoque_atual: Number(r.valor_estoque_atual || 0),
      })) as InventoryMovementRow[];
    }

    throw new Error("Formato de conexão do banco de dados não suportado.");
  } catch (error) {
    console.error("Erro ao ler dados do banco de dados:", error);
    throw error;
  }
}

