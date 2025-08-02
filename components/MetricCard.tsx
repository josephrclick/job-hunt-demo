import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string | number;
}

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col items-center">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground text-center whitespace-nowrap">
          {label}
        </div>
      </CardContent>
    </Card>
  );
} 