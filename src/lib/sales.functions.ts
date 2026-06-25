import { createServerFn } from "@tanstack/react-start";

export type DataSource = "csv" | "database";

export interface InventoryMovementRowDTO {
  key_centro: string;
  nome_centro: string;
  empresa: string;
  nome_empreendimento: string;
  cod_insumo: string;
  cod_sub_grupo: string;
  descricao_insumo: string;
  unidade: string;
  data_movimento: string;
  classe: "E" | "S";
  tipo_movimento: string;
  tipo_documento: string;
  numero_documento: string;
  num_movimento: number;
  quantidade: number;
  preco_unitario: number;
  valor: number;
  titulo_grupo: string;
  titulo_subgrupo: string;
  quantidade_estoque_atual: number;
  valor_estoque_atual: number;
}

export interface SalesPayload {
  source: DataSource;
  rows: InventoryMovementRowDTO[];
  available: { csv: boolean; database: boolean };
}

export const getSales = createServerFn({ method: "GET" })
  .inputValidator((input: { source?: DataSource } | undefined) => ({
    source: (input?.source ?? "csv") as DataSource,
  }))
  .handler(async ({ data }): Promise<SalesPayload> => {
    const { readInventoryCsv } = await import("../server/csv-source.server");
    const { readInventoryFromDatabase } = await import(
      "../server/database-source.server"
    );

    const isDbConfigured = !!(
      process.env.DATABASE_URL ||
      process.env.DB_HOST ||
      process.env.DB_CONNECTION_STRING ||
      process.env.DB_SERVER
    );


    const rows =
      data.source === "database"
        ? await readInventoryFromDatabase()
        : await readInventoryCsv();

    return {
      source: data.source,
      rows,
      available: {
        csv: true,
        database: true, // Sempre habilitado para permitir testar a conexão e debugar erros na tela
      },
    };

  });

