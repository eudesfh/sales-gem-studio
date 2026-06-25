/**
 * CSV data source (server-only).
 * Reads the bundled fictitious sales CSV from /public/data/vendas.csv.
 *
 * To plug a new file-based source, add another reader here and expose it
 * through src/lib/sales.functions.ts.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface SaleRow {
  data: string;
  produto: string;
  categoria: string;
  regiao: string;
  preco: number;
  quantidade: number;
  valor_total: number;
}

function parseCsv(text: string): SaleRow[] {
  const lines = text.trim().split(/\r?\n/);
  const [header, ...rest] = lines;
  const cols = header.split(",");
  return rest.map((line) => {
    const parts = line.split(",");
    const row: Record<string, string> = {};
    cols.forEach((c, i) => (row[c] = parts[i]));
    return {
      data: row.data,
      produto: row.produto,
      categoria: row.categoria,
      regiao: row.regiao,
      preco: Number(row.preco),
      quantidade: Number(row.quantidade),
      valor_total: Number(row.valor_total),
    };
  });
}

export async function readSalesCsv(): Promise<SaleRow[]> {
  const path = join(process.cwd(), "public", "data", "vendas.csv");
  const text = await readFile(path, "utf-8");
  return parseCsv(text);
}
