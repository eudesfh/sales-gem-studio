import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatInt } from "../aggregations";

interface Props {
  title: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  color?: string;
  layout?: "horizontal" | "vertical";
}

export function BarChartCard({
  title,
  data,
  xKey,
  yKey,
  color = "var(--chart-1)",
  layout = "horizontal",
}: Props) {
  const isVertical = layout === "vertical";
  
  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout={layout}
              margin={{ 
                top: 15, 
                right: isVertical ? 65 : 16, 
                left: isVertical ? 0 : 0, 
                bottom: 8 
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                horizontal={!isVertical}
                vertical={isVertical}
              />
              {isVertical ? (
                <>
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatBRL(Number(v))}
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    hide={true} // Hide X axis for clean Power BI look with LabelList
                  />
                  <YAxis
                    type="category"
                    dataKey={xKey}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    width={180}
                    tickLine={false}
                    axisLine={false}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={xKey}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatBRL(Number(v))}
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                  />
                </>
              )}
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatBRL(v), "Consumo"]}
              />
              <Bar dataKey={yKey} fill={color} radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={24}>
                {isVertical && (
                  <LabelList
                    dataKey={yKey}
                    position="right"
                    formatter={(v: number) => formatInt(v)}
                    style={{ fontSize: 10, fill: "var(--foreground)", fontWeight: 500 }}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

