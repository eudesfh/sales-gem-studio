import { createServerFn } from "@tanstack/react-start";

export type DataSource = "csv" | "database";

export interface SaleRowDTO {
  data: string;
  produto: string;
  categoria: string;
  regiao: string;
  preco: number;
  quantidade: number;
  valor_total: number;
}

export interface SalesPayload {
  source: DataSource;
  rows: SaleRowDTO[];
  available: { csv: boolean; database: boolean };
}

export const getSales = createServerFn({ method: "GET" })
  .inputValidator((input: { source?: DataSource } | undefined) => ({
    source: (input?.source ?? "csv") as DataSource,
  }))
  .handler(async ({ data }): Promise<SalesPayload> => {
    const { readSalesCsv } = await import("../server/csv-source.server");
    const { readSalesFromDatabase } = await import(
      "../server/database-source.server"
    );

    const rows =
      data.source === "database"
        ? await readSalesFromDatabase()
        : await readSalesCsv();

    return {
      source: data.source,
      rows,
      available: {
        csv: true,
        database: false, // flip to true once you wire a real DB connection
      },
    };
  });
