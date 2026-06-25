# Dashboard de Vendas (estilo Power BI)

Dashboard analítico construído com **TanStack Start** (React + Vite full-stack),
**Recharts** para gráficos e **shadcn/ui** + **Tailwind v4** para a interface.

## Estrutura

```
.
├── public/
│   └── data/
│       └── vendas.csv              # base fictícia (240 registros)
├── src/
│   ├── server/                     # camada "backend" — só executa no servidor
│   │   ├── csv-source.server.ts    # leitor da base CSV
│   │   └── database-source.server.ts  # stub para conexão com banco
│   ├── lib/
│   │   └── sales.functions.ts      # RPC (createServerFn) usado pelo frontend
│   ├── features/
│   │   └── dashboard/              # frontend do dashboard
│   │       ├── aggregations.ts     # KPIs e agregações
│   │       └── components/         # KpiCard, BarChartCard, DataSourceSelector
│   ├── routes/                     # páginas (file-based routing)
│   └── components/ui/              # shadcn/ui
├── .gitignore
├── package.json
└── vite.config.ts
```

> Observação: TanStack Start é full-stack em um único processo, então não há
> pastas `backend/` e `frontend/` separadas. A camada "servidor" vive em
> `src/server/*.server.ts` (bloqueada no bundle do cliente) e é exposta ao
> frontend por funções RPC em `src/lib/*.functions.ts`.

## Adicionar uma nova fonte de dados (ex.: Postgres)

1. Instale o driver: `bun add pg`
2. Implemente em `src/server/database-source.server.ts`:
   ```ts
   import { Pool } from "pg";
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   export async function readSalesFromDatabase() {
     const { rows } = await pool.query(
       "SELECT data, produto, categoria, regiao, preco, quantidade, valor_total FROM vendas"
     );
     return rows;
   }
   ```
3. Em `src/lib/sales.functions.ts`, troque `available.database` para `true`.
4. Defina `DATABASE_URL` nas variáveis de ambiente do servidor.

O seletor de fonte no topo do dashboard passa a permitir alternar entre CSV
e banco sem mexer no frontend.

## Scripts

- `bun run dev` — ambiente de desenvolvimento
- `bun run build` — build de produção
