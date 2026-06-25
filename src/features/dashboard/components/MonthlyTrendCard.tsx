import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, type MonthPoint } from "../aggregations";

interface Props {
  title: string;
  data: MonthPoint[];
}

export function MonthlyTrendCard({ title, data }: Props) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="mes"
                stroke="var(--muted-foreground)"
                fontSize={11}
              />
              <YAxis
                tickFormatter={(v) => formatBRL(Number(v))}
                stroke="var(--muted-foreground)"
                fontSize={11}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number, name: string) => [
                  formatBRL(v),
                  name === "valor" ? "Receita do mês" : "Acumulado",
                ]}
              />
              <Bar
                dataKey="acumulado"
                fill="var(--chart-1)"
                radius={[6, 6, 0, 0]}
                barSize={48}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
