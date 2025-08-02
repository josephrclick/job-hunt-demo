import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealbreakerBadgeProps {
  dealbreakerHit?: boolean;
  extractedFields?: Record<string, unknown>;
  className?: string;
}

export function DealbreakerBadge({
  dealbreakerHit,
  extractedFields,
  className
}: DealbreakerBadgeProps) {
  // Don't render if no dealbreaker detected
  if (!dealbreakerHit) {
    return null;
  }

  // Try to determine the specific dealbreaker from extracted fields
  const getDealbreakerReason = (fields?: Record<string, unknown>): string => {
    if (!fields) return "Dealbreaker detected";

    // Check for common dealbreakers
    if (fields.requires_clearance === true) {
      return "Requires Security Clearance";
    }
    
    if (fields.location_type === "onsite") {
      return "On-site Required";
    }
    
    if (typeof fields.travel_pct === "number" && fields.travel_pct > 50) {
      return `${fields.travel_pct}% Travel Required`;
    }
    
    if (typeof fields.experience_years_min === "number" && fields.experience_years_min > 10) {
      return `${fields.experience_years_min}+ Years Required`;
    }

    // Generic fallback
    return "Dealbreaker detected";
  };

  const reason = getDealbreakerReason(extractedFields);

  return (
    <Badge
      variant="destructive"
      className={cn(
        "flex items-center gap-1 text-xs font-semibold",
        "bg-red-100 text-red-800 border-red-300",
        "hover:bg-red-200",
        className
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      🚫 DEALBREAKER: {reason}
    </Badge>
  );
}