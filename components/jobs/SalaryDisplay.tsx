import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalaryDisplayProps {
  compRange?: string;
  compMin?: number;
  compMax?: number;
  compCurrency?: string;
  className?: string;
  variant?: "badge" | "text";
}

export function SalaryDisplay({
  compRange,
  compMin,
  compMax,
  compCurrency = "USD",
  className,
  variant = "text"
}: SalaryDisplayProps) {
  // Use pre-formatted string if available, otherwise construct from components
  let displayText: string | null = null;

  if (compRange) {
    displayText = compRange;
  } else if (compMin && compMax) {
    displayText = `$${compMin.toLocaleString()} - $${compMax.toLocaleString()} ${compCurrency}`;
  } else if (compMin) {
    displayText = `$${compMin.toLocaleString()}+ ${compCurrency}`;
  } else if (compMax) {
    displayText = `Up to $${compMax.toLocaleString()} ${compCurrency}`;
  }

  // Don't render if no salary data
  if (!displayText) {
    return null;
  }

  if (variant === "badge") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "flex items-center gap-1 text-xs font-semibold",
          "bg-blue-100 text-blue-800 border-blue-300",
          "hover:bg-blue-200",
          className
        )}
      >
        <DollarSign className="h-3 w-3" />
        {displayText}
      </Badge>
    );
  }

  return (
    <span
      className={cn(
        "text-sm font-semibold text-blue-600",
        className
      )}
    >
      {displayText}
    </span>
  );
}