import type { InventoryMovementRowDTO } from "@/lib/sales.functions";

export interface InventoryKpis {
  entradas: number;
  saidas: number;
  saldoAtual: number;
  transferencias: number;
}

export function computeInventoryKpis(rows: InventoryMovementRowDTO[]): InventoryKpis {
  let entradas = 0;
  let saidas = 0;
  let transferencias = 0;

  for (const r of rows) {
    if (r.classe === "E") {
      entradas += r.valor;
    } else if (r.classe === "S") {
      if (r.tipo_documento === "TRF" || r.tipo_movimento === "T") {
        transferencias += r.valor;
      } else {
        saidas += r.valor;
      }
    }
  }

  return {
    entradas,
    saidas,
    saldoAtual: entradas - saidas,
    transferencias,
  };
}

export interface CategoryConsumption {
  categoria: string;
  valor: number;
}

export function byCategory(rows: InventoryMovementRowDTO[]): CategoryConsumption[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    // Only count consumption (exits that are not transfers)
    if (r.classe === "S" && r.tipo_documento !== "TRF" && r.tipo_movimento !== "T") {
      map.set(r.titulo_grupo, (map.get(r.titulo_grupo) ?? 0) + r.valor);
    }
  }
  return Array.from(map, ([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor);
}

export interface StockMaterial {
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valor: number;
}

export function computeStockMaterials(rows: InventoryMovementRowDTO[]): StockMaterial[] {
  const map = new Map<string, { desc: string; und: string; qty: number; val: number }>();
  
  for (const r of rows) {
    const existing = map.get(r.cod_insumo) ?? { desc: r.descricao_insumo, und: r.unidade, qty: 0, val: 0 };
    
    if (r.classe === "E") {
      existing.qty += r.quantidade;
      existing.val += r.valor;
    } else if (r.classe === "S") {
      existing.qty -= r.quantidade;
      existing.val -= r.valor;
    }
    
    map.set(r.cod_insumo, existing);
  }

  return Array.from(map, ([codigo, info]) => ({
    codigo,
    descricao: info.desc,
    unidade: info.und,
    quantidade: Math.max(0, info.qty),
    valor: Math.max(0, info.val),
  })).sort((a, b) => b.valor - a.valor);
}

export interface MonthConsumptionPoint {
  mes: string;
  mesLabel: string;
  valor: number;
  percentageChange: number | null;
}

export function byMonthConsumption(rows: InventoryMovementRowDTO[]): MonthConsumptionPoint[] {
  const map = new Map<string, number>();
  
  for (const r of rows) {
    if (r.classe === "S" && r.tipo_documento !== "TRF" && r.tipo_movimento !== "T") {
      const mes = r.data_movimento.slice(0, 7); // YYYY-MM
      map.set(mes, (map.get(mes) ?? 0) + r.valor);
    }
  }

  const sortedMonths = Array.from(map, ([mes, valor]) => ({ mes, valor })).sort(
    (a, b) => a.mes.localeCompare(b.mes),
  );

  const monthsMapPT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  return sortedMonths.map((m, index) => {
    const [year, month] = m.mes.split("-");
    const mesIndex = parseInt(month, 10) - 1;
    const mesLabel = monthsMapPT[mesIndex] || month;

    let percentageChange: number | null = null;
    if (index > 0) {
      const prevVal = sortedMonths[index - 1].valor;
      if (prevVal > 0) {
        percentageChange = ((m.valor - prevVal) / prevVal) * 100;
      }
    }

    return {
      mes: m.mes,
      mesLabel,
      valor: m.valor,
      percentageChange,
    };
  });
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

export const formatCompactBRL = (n: number) => {
  if (n >= 1_000_000) {
    return `R$ ${(n / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} Mi`;
  }
  if (n >= 1_000) {
    return `R$ ${(n / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} Mil`;
  }
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const formatInt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

