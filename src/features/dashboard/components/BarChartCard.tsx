import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "../aggregations";

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
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout={layout}
              margin={{ top: 8, right: 16, left: isVertical ? 24 : 0, bottom: 8 }}
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
                    fontSize={11}
                  />
                  <YAxis
                    type="category"
                    dataKey={xKey}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    width={140}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={xKey}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />
                  <YAxis
                    tickFormatter={(v) => formatBRL(Number(v))}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />
                </>
              )}
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatBRL(v), "Receita"]}
              />
              <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
