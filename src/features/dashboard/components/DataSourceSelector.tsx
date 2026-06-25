import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DataSource } from "@/lib/sales.functions";

interface Props {
  value: DataSource;
  onChange: (v: DataSource) => void;
  available: { csv: boolean; database: boolean };
}

export function DataSourceSelector({ value, onChange, available }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        Fonte de dados
      </span>
      <Select value={value} onValueChange={(v) => onChange(v as DataSource)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="csv" disabled={!available.csv}>
            Arquivo CSV
          </SelectItem>
          <SelectItem value="database" disabled={!available.database}>
            Banco de dados {available.database ? "" : "(não configurado)"}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
