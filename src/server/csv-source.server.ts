/**
 * CSV data source (server-only).
 * Reads the bundled inventory movements CSV from /public/data/movimentacoes_estoque.csv.
 *
 * To plug a new file-based source, add another reader here and expose it
 * through src/lib/sales.functions.ts.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { InventoryMovementRowDTO } from "../lib/sales.functions";

export type InventoryMovementRow = InventoryMovementRowDTO;

function parseCsv(text: string): InventoryMovementRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const [header, ...rest] = lines;
  const cols = header.split(",");

  return rest.map((line) => {
    const parts = line.split(",");
    const row: Record<string, string> = {};
    cols.forEach((c, i) => (row[c] = parts[i] || ""));

    return {
      key_centro: row.key_centro,
      nome_centro: row.nome_centro,
      empresa: row.empresa,
      nome_empreendimento: row.nome_empreendimento,
      cod_insumo: row.cod_insumo,
      cod_sub_grupo: row.cod_sub_grupo,
      descricao_insumo: row.descricao_insumo,
      unidade: row.unidade,
      data_movimento: row.data_movimento,
      classe: row.classe as "E" | "S",
      tipo_movimento: row.tipo_movimento,
      tipo_documento: row.tipo_documento,
      numero_documento: row.numero_documento,
      num_movimento: Number(row.num_movimento || 0),
      quantidade: Number(row.quantidade || 0),
      preco_unitario: Number(row.preco_unitario || 0),
      valor: Number(row.valor || 0),
      titulo_grupo: row.titulo_grupo,
      titulo_subgrupo: row.titulo_subgrupo,
      quantidade_estoque_atual: Number(row.quantidade_estoque_atual || 0),
      valor_estoque_atual: Number(row.valor_estoque_atual || 0),
    };
  });
}

export async function readInventoryCsv(): Promise<InventoryMovementRow[]> {
  const path = join(process.cwd(), "public", "data", "movimentacoes_estoque.csv");
  const text = await readFile(path, "utf-8");
  return parseCsv(text);
}

