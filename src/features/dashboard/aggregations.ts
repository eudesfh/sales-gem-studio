import type { SaleRowDTO } from "@/lib/sales.functions";

export interface Kpis {
  receita: number;
  pedidos: number;
  itensVendidos: number;
  ticketMedio: number;
}

export function computeKpis(rows: SaleRowDTO[]): Kpis {
  const receita = rows.reduce((s, r) => s + r.valor_total, 0);
  const pedidos = rows.length;
  const itensVendidos = rows.reduce((s, r) => s + r.quantidade, 0);
  return {
    receita,
    pedidos,
    itensVendidos,
    ticketMedio: pedidos ? receita / pedidos : 0,
  };
}

export function byCategory(rows: SaleRowDTO[]) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.categoria, (map.get(r.categoria) ?? 0) + r.valor_total);
  return Array.from(map, ([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor);
}

export function topProducts(rows: SaleRowDTO[], n = 8) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.produto, (map.get(r.produto) ?? 0) + r.valor_total);
  return Array.from(map, ([produto, valor]) => ({ produto, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, n);
}

export interface MonthPoint {
  mes: string;
  valor: number | null;
  acumulado: number | null;
}

export function byMonth(rows: SaleRowDTO[]): MonthPoint[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const mes = r.data.slice(0, 7); // YYYY-MM
    map.set(mes, (map.get(mes) ?? 0) + r.valor_total);
  }
  const monthly = Array.from(map, ([mes, valor]) => ({ mes, valor })).sort(
    (a, b) => a.mes.localeCompare(b.mes),
  );
  const total = monthly.reduce((s, m) => s + m.valor, 0);
  const points: MonthPoint[] = monthly.map((m) => ({
    mes: m.mes,
    valor: m.valor,
    acumulado: null,
  }));
  points.push({ mes: "Total", valor: null, acumulado: total });
  return points;
}

export function byRegion(rows: SaleRowDTO[]) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.regiao, (map.get(r.regiao) ?? 0) + r.valor_total);
  return Array.from(map, ([regiao, valor]) => ({ regiao, valor })).sort(
    (a, b) => b.valor - a.valor,
  );
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const formatInt = (n: number) => n.toLocaleString("pt-BR");
