import { createFileRoute, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getSales, type DataSource, type InventoryMovementRowDTO } from "@/lib/sales.functions";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { BarChartCard } from "@/features/dashboard/components/BarChartCard";
import { MonthlyTrendCard } from "@/features/dashboard/components/MonthlyTrendCard";
import { DataSourceSelector } from "@/features/dashboard/components/DataSourceSelector";
import {
  computeInventoryKpis,
  byCategory,
  byMonthConsumption,
  computeStockMaterials,
  formatBRL,
  formatCompactBRL,
  formatInt,
} from "@/features/dashboard/aggregations";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  ArrowLeftRight,
  Search,
  Calendar,
  Building2,
  Database,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

const salesQuery = (source: DataSource) =>
  queryOptions({
    queryKey: ["sales", source],
    queryFn: () => getSales({ data: { source } }),
  });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Movimentações de Estoque" },
      {
        name: "description",
        content: "Simulação do relatório de movimentação de estoque Power BI com KPIs e detalhamento de insumos.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(salesQuery("csv")),
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 rounded-lg m-6">
      Erro ao carregar dados: {error.message}
    </div>
  ),
});

function Dashboard() {
  const router = useRouter();
  const [source, setSource] = useState<DataSource>("csv");
  const { data } = useSuspenseQuery(salesQuery(source));

  // Filters State
  const [selectedCentro, setSelectedCentro] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Table State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<"codigo" | "descricao" | "quantidade" | "valor">("valor");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const rawRows = data.rows;

  // Extract unique cost centers for filter list
  const uniqueCentros = useMemo(() => {
    const set = new Set<string>();
    for (const r of rawRows) {
      if (r.nome_centro) set.add(r.nome_centro);
    }
    return Array.from(set).sort();
  }, [rawRows]);

  // Extract date bounds for presets
  const dateBounds = useMemo(() => {
    if (rawRows.length === 0) return { min: "", max: "" };
    const dates = rawRows.map((r) => r.data_movimento).filter(Boolean);
    dates.sort();
    return {
      min: dates[0],
      max: dates[dates.length - 1],
    };
  }, [rawRows]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return rawRows.filter((r) => {
      // 1. Cost Center Filter
      if (selectedCentro !== "all" && r.nome_centro !== selectedCentro) {
        return false;
      }
      // 2. Start Date Filter
      if (startDate && r.data_movimento < startDate) {
        return false;
      }
      // 3. End Date Filter
      if (endDate && r.data_movimento > endDate) {
        return false;
      }
      return true;
    });
  }, [rawRows, selectedCentro, startDate, endDate]);

  // Aggregations
  const kpis = useMemo(() => computeInventoryKpis(filteredRows), [filteredRows]);
  const categories = useMemo(() => byCategory(filteredRows), [filteredRows]);
  const monthlyConsumption = useMemo(() => byMonthConsumption(filteredRows), [filteredRows]);
  const stockMaterials = useMemo(() => computeStockMaterials(filteredRows), [filteredRows]);

  // Apply Search & Sort to Stock Materials Table
  const processedMaterials = useMemo(() => {
    let result = [...stockMaterials];

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.codigo.toLowerCase().includes(q) ||
          m.descricao.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") {
        return sortAsc
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      return sortAsc
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

    return result;
  }, [stockMaterials, searchTerm, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(processedMaterials.length / pageSize) || 1;
  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedMaterials.slice(startIndex, startIndex + pageSize);
  }, [processedMaterials, currentPage]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCentro("all");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Decorative top gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-500" />

      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Movimentações de Estoque
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Análise consolidada por obra e período · {formatInt(filteredRows.length)} lançamentos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <DataSourceSelector
              value={source}
              onChange={(s) => {
                setSource(s);
                handleClearFilters();
              }}
              available={data.available}
            />

            <button
              onClick={() => router.invalidate()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
              title="Recarregar dados"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Filters Panel */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800/60">
            <SlidersHorizontal className="h-4 w-4 text-blue-500" />
            Painel de Filtros
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Cost Center Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Obra / Centro de Custo</label>
              <div className="relative">
                <select
                  value={selectedCentro}
                  onChange={(e) => {
                    setSelectedCentro(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Todos os Centros (Consolidado)</option>
                  {uniqueCentros.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                  ▼
                </div>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Data Inicial</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  min={dateBounds.min}
                  max={dateBounds.max}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Data Final</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  min={dateBounds.min}
                  max={dateBounds.max}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleClearFilters}
                className="w-full rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer h-[34px]"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </section>

        {filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center space-y-3">
            <Info className="h-8 w-8 text-amber-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Nenhum registro encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Nenhuma movimentação corresponde aos filtros selecionados. Tente alterar o período ou limpar os filtros.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              Resetar Filtros
            </button>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Entradas (Mês)"
                value={formatCompactBRL(kpis.entradas)}
                hint="Total Movimentado no Período"
                icon={<ArrowDownCircle className="h-5 w-5" />}
                iconBgClass="bg-blue-500/10 text-blue-400 border border-blue-500/20"
              />
              <KpiCard
                label="Saídas (Mês)"
                value={formatCompactBRL(kpis.saidas)}
                hint="Consumo Realizado"
                icon={<ArrowUpCircle className="h-5 w-5" />}
                iconBgClass="bg-amber-500/10 text-amber-400 border border-amber-500/20"
              />
              <KpiCard
                label="Saldo Atual"
                value={formatCompactBRL(kpis.saldoAtual)}
                hint="Disponível em Estoque"
                icon={<Package className="h-5 w-5" />}
                iconBgClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              />
              <KpiCard
                label="Transferências"
                value={formatCompactBRL(kpis.transferencias)}
                hint="Transferências (Saídas) de Insumos"
                icon={<ArrowLeftRight className="h-5 w-5" />}
                iconBgClass="bg-purple-500/10 text-purple-400 border border-purple-500/20"
              />
            </section>

            {/* Monthly Trend Area Chart */}
            <section>
              <MonthlyTrendCard
                title="Consumo Realizado por Mês"
                data={monthlyConsumption}
              />
            </section>

            {/* Bottom Row: Materials Table & Categories Chart */}
            <section className="grid gap-6 lg:grid-cols-12">
              {/* Materials Table */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Materiais em estoque na Obra</h3>
                    <p className="text-[11px] text-slate-400">Materiais ordenados por valor em estoque</p>
                  </div>
                  {/* Table Search */}
                  <div className="relative w-48 sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Pesquisar material..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-400 font-semibold border-b border-slate-800/40">
                        <th
                          className="py-3 px-2 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("codigo")}
                        >
                          Código {sortField === "codigo" && (sortAsc ? "▲" : "▼")}
                        </th>
                        <th
                          className="py-3 px-2 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("descricao")}
                        >
                          Descrição Insumo {sortField === "descricao" && (sortAsc ? "▲" : "▼")}
                        </th>
                        <th className="py-3 px-2">Und</th>
                        <th
                          className="py-3 px-2 text-right cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("quantidade")}
                        >
                          Quantidade {sortField === "quantidade" && (sortAsc ? "▲" : "▼")}
                        </th>
                        <th
                          className="py-3 px-2 text-right cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("valor")}
                        >
                          Valor {sortField === "valor" && (sortAsc ? "▲" : "▼")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {paginatedMaterials.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            Nenhum insumo encontrado.
                          </td>
                        </tr>
                      ) : (
                        paginatedMaterials.map((m) => (
                          <tr key={m.codigo} className="hover:bg-slate-900/30 transition-all font-medium text-slate-300">
                            <td className="py-3 px-2 text-slate-400 font-mono">{m.codigo}</td>
                            <td className="py-3 px-2 text-white truncate max-w-[200px]" title={m.descricao}>
                              {m.descricao}
                            </td>
                            <td className="py-3 px-2 text-slate-400 font-semibold uppercase">{m.unidade}</td>
                            <td className="py-3 px-2 text-right font-mono text-slate-200">
                              {formatInt(m.quantidade)}
                            </td>
                            <td className="py-3 px-2 text-right font-bold text-emerald-400">
                              {formatCompactBRL(m.valor)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-800/40 pt-4 text-slate-400 text-xs">
                    <div>
                      Página {currentPage} de {totalPages} · {processedMaterials.length} itens
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Categories Chart */}
              <div className="lg:col-span-5">
                <BarChartCard
                  title="Consumo por Categoria"
                  data={categories}
                  xKey="categoria"
                  yKey="valor"
                  color="oklch(0.488 0.243 264.376)" // Primary blue / purple
                  layout="vertical"
                />
              </div>
            </section>
          </>
        )}

        {/* Database Config Guide */}
        <section className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Database className="h-4 w-4 text-indigo-400" />
            Como conectar seu Banco de Dados real?
          </div>
          <div className="text-xs text-slate-300 leading-relaxed space-y-3">
            <p>
              Atualmente, o simulador está rodando sobre dados estáticos (arquivo CSV). Para plugar seu banco
              de dados em nuvem e alimentar os visuais com a view <code className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800 font-mono text-indigo-300">vw_fact_movimentacao_estoque</code>:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-400 font-medium">
              <li>
                Configure as variáveis de ambiente no arquivo <code className="bg-slate-950 px-1 rounded text-white font-mono">.env</code> do projeto:
                <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-emerald-400 font-mono mt-1 overflow-x-auto">
                  DATABASE_URL="postgresql://usuario:senha@host:porta/banco?sslmode=require"{"\n"}
                  # OU para SQL Server:{"\n"}
                  DB_CONNECTION_STRING="Server=seu-servidor.database.windows.net;Database=seu-db;User Id=usuario;Password=senha;Encrypt=true;"
                </pre>
              </li>
              <li>
                Instale o driver do banco rodando no terminal:
                <code className="block bg-slate-950 p-1.5 rounded font-mono text-indigo-300 mt-1 border border-slate-800">bun add pg</code>
                ou <code className="block bg-slate-950 p-1.5 rounded font-mono text-indigo-300 mt-1 border border-slate-800">bun add mssql</code>
              </li>
              <li>
                Ao recarregar o servidor, o seletor de "Fonte de dados" no topo permitirá escolher "Banco de dados" e buscará os registros em tempo real!
              </li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}

