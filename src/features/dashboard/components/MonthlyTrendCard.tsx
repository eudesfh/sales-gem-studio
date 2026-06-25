import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactBRL, type MonthConsumptionPoint } from "../aggregations";

interface Props {
  title: string;
  data: MonthConsumptionPoint[];
}

export function MonthlyTrendCard({ title, data }: Props) {
  // Custom SVG renderer for the MoM percentage change above each dot
  const renderMoMLabel = (props: any) => {
    const { x, y, index } = props;
    const point = data[index];
    if (!point || point.percentageChange === null || point.percentageChange === undefined) {
      return null;
    }
    const pct = point.percentageChange;
    const isPositive = pct > 0;
    const arrow = isPositive ? "▲" : "▼";
    const text = `${arrow} ${Math.abs(pct).toFixed(1)}%`;
    const fill = isPositive ? "oklch(0.627 0.194 149.251)" : "oklch(0.637 0.237 25.331)"; // emerald-500 or red-500
    
    return (
      <g>
        <text 
          x={x} 
          y={y - 12} 
          fill={fill} 
          fontSize={10} 
          fontWeight="700" 
          textAnchor="middle"
          className="filter drop-shadow-sm font-sans"
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 25, right: 16, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="mesLabel"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCompactBRL(Number(v))}
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--muted)", strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number, name: string, props: any) => {
                  const pct = props.payload.percentageChange;
                  const pctText = pct !== null && pct !== undefined
                    ? ` (${pct > 0 ? "+" : ""}${pct.toFixed(1)}% MoM)`
                    : "";
                  return [
                    `${formatCompactBRL(v)}${pctText}`,
                    "Consumo Realizado"
                  ];
                }}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="var(--chart-1)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorConsumo)"
                label={renderMoMLabel}
                dot={{ r: 4, stroke: "var(--background)", strokeWidth: 2, fill: "var(--chart-1)" }}
                activeDot={{ r: 6, stroke: "var(--background)", strokeWidth: 2, fill: "var(--chart-1)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

