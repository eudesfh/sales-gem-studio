# Dashboard de Movimentações de Estoque (estilo Power BI)

Dashboard analítico construído com **TanStack Start** (React + Vite full-stack),
**Recharts** para gráficos e **shadcn/ui** + **Tailwind v4** para a interface.

## Estrutura

```
.
├── public/
│   └── data/
│       └── movimentacoes_estoque.csv # base simulando vw_fact_movimentacao_estoque
├── src/
│   ├── server/                     # camada "backend" — só executa no servidor
│   │   ├── csv-source.server.ts    # leitor da base CSV de estoque
│   │   └── database-source.server.ts # conexão com banco de dados real
│   ├── lib/
│   │   └── sales.functions.ts      # RPC (createServerFn) usado pelo frontend
│   ├── features/
│   │   └── dashboard/              # frontend do dashboard
│   │       ├── aggregations.ts     # KPIs e agregações de estoque
│   │       └── components/         # KpiCard, BarChartCard, DataSourceSelector
│   ├── routes/                     # páginas (file-based routing)
│   └── components/ui/              # shadcn/ui
├── .gitignore
├── package.json
├── vite.config.ts
└── README.md
```

> Observação: TanStack Start é full-stack em um único processo, então não há
> pastas `backend/` e `frontend/` separadas. A camada "servidor" vive em
> `src/server/*.server.ts` (bloqueada no bundle do cliente) e é exposta ao
> frontend por funções RPC em `src/lib/*.functions.ts`.

## Adicionar uma nova fonte de dados (ex.: Postgres ou SQL Server)

1. Instale o driver: `npm install pg` ou `npm install mssql`
2. Defina as variáveis de ambiente no arquivo `.env`:
   ```env
   DATABASE_URL="postgresql://usuario:senha@host:porta/banco?sslmode=require"
   # OU para SQL Server:
   DB_CONNECTION_STRING="Server=seu-servidor.database.windows.net;Database=seu-db;User Id=usuario;Password=senha;Encrypt=true;"
   ```
3. O servidor detectará automaticamente as variáveis de ambiente e habilitará a opção "Banco de dados" no seletor de fonte do topo, efetuando as consultas na view `vw_fact_movimentacao_estoque`.

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção

