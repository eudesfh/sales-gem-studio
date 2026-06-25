import { createFileRoute, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getSales, type DataSource } from "@/lib/sales.functions";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { BarChartCard } from "@/features/dashboard/components/BarChartCard";
import { MonthlyTrendCard } from "@/features/dashboard/components/MonthlyTrendCard";
import { DataSourceSelector } from "@/features/dashboard/components/DataSourceSelector";
import {
  byCategory,
  byMonth,
  byRegion,
  computeKpis,
  formatBRL,
  formatInt,
  topProducts,
} from "@/features/dashboard/aggregations";

const salesQuery = (source: DataSource) =>
  queryOptions({
    queryKey: ["sales", source],
    queryFn: () => getSales({ data: { source } }),
  });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard de Vendas" },
      {
        name: "description",
        content:
          "Dashboard interativo de vendas com KPIs e gráficos de barras a partir de CSV ou banco de dados.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(salesQuery("csv")),
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive">{error.message}</div>
  ),
});

function Dashboard() {
  const router = useRouter();
  const [source, setSource] = useState<DataSource>("csv");
  const { data } = useSuspenseQuery(salesQuery(source));

  const kpis = computeKpis(data.rows);
  const cats = byCategory(data.rows);
  const top = topProducts(data.rows);
  const months = byMonth(data.rows);
  const regions = byRegion(data.rows);

  const empty = data.rows.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Dashboard de Vendas
            </h1>
            <p className="text-xs text-muted-foreground">
              Visão analítica · {formatInt(data.rows.length)} registros · fonte:{" "}
              {source === "csv" ? "CSV" : "Banco de dados"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DataSourceSelector
              value={source}
              onChange={setSource}
              available={data.available}
            />
            <button
              onClick={() => router.invalidate()}
              className="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {empty ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum dado retornado por esta fonte. Configure uma conexão em{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                src/server/database-source.server.ts
              </code>
              .
            </p>
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Receita total" value={formatBRL(kpis.receita)} />
              <KpiCard label="Pedidos" value={formatInt(kpis.pedidos)} />
              <KpiCard
                label="Itens vendidos"
                value={formatInt(kpis.itensVendidos)}
              />
              <KpiCard
                label="Ticket médio"
                value={formatBRL(kpis.ticketMedio)}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <BarChartCard
                title="Receita por categoria"
                data={cats}
                xKey="categoria"
                yKey="valor"
                color="var(--chart-1)"
              />
              <MonthlyTrendCard
                title="Receita por mês (linha) + Acumulado (barra)"
                data={months}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <BarChartCard
                title="Top produtos"
                data={top}
                xKey="produto"
                yKey="valor"
                color="var(--chart-2)"
                layout="vertical"
              />
              <BarChartCard
                title="Receita por região"
                data={regions}
                xKey="regiao"
                yKey="valor"
                color="var(--chart-4)"
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
