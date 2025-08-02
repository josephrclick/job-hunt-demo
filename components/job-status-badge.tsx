import { Badge, BadgeProps } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Clock, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobStatusBadgeProps {
  // Pipeline status (e.g., "interested", "applied", etc.)
  status?: string;
  // AI fit score (0-100)
  aiFitScore?: number | null;
  // Enrichment status from backend
  enrichmentStatus?: string;
  // Whether to show enrichment status prominently
  showEnrichmentStatus?: boolean;
  className?: string;
}

// Pipeline stage labels
const STAGE_LABEL: Record<string, string> = {
  interested: "Interested",
  applied: "Applied",
  recruiter_screen: "Recruiter Screen",
  hiring_manager: "Hiring Manager",
  peer: "Peer",
  panel_mock_demo: "Panel/Mock/Demo",
  offer: "Offer",
  rejected: "Rejected",
};

// AI fit score badge variant logic
const getFitBadgeVariant = (score?: number | null): BadgeProps['variant'] => {
  if (score === undefined || score === null) return "outline";
  if (score >= 80) return "default"; // Green
  if (score >= 60) return "secondary"; // Yellow
  if (score >= 40) return "destructive"; // Red
  return "outline";
};

// Enrichment status badge configuration
const getEnrichmentConfig = (status?: string) => {
  switch (status) {
    case "completed":
      return {
        variant: "default" as BadgeProps['variant'],
        label: "Enriched",
        icon: CheckCircle,
        className: "text-green-800 bg-green-100 border-green-200"
      };
    case "pending":
      return {
        variant: "secondary" as BadgeProps['variant'],
        label: "Enriching",
        icon: Loader2,
        className: "text-blue-800 bg-blue-100 border-blue-200",
        animate: true
      };
    case "failed":
      return {
        variant: "destructive" as BadgeProps['variant'],
        label: "Failed",
        icon: AlertTriangle,
        className: "text-red-800 bg-red-100 border-red-200"
      };
    default:
      return {
        variant: "outline" as BadgeProps['variant'],
        label: "Not Enriched",
        icon: Clock,
        className: "text-gray-600 bg-gray-50 border-gray-200"
      };
  }
};

export function JobStatusBadge({ 
  status, 
  aiFitScore, 
  enrichmentStatus, 
  showEnrichmentStatus = false,
  className 
}: JobStatusBadgeProps) {
  const displayStatus = status ? STAGE_LABEL[status] || status : null;
  const displayFitScore = aiFitScore !== undefined && aiFitScore !== null ? aiFitScore : null;
  const enrichmentConfig = getEnrichmentConfig(enrichmentStatus);
  const EnrichmentIcon = enrichmentConfig.icon;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* AI Fit Score Badge */}
      {displayFitScore !== null && (
        <Badge variant={getFitBadgeVariant(displayFitScore)}>
          <Zap className="h-3 w-3 mr-1" />
          Fit {displayFitScore}%
        </Badge>
      )}

      {/* Pipeline Status Badge */}
      {displayStatus && (
        <Badge variant="outline">
          {displayStatus}
        </Badge>
      )}

      {/* Enrichment Status Badge */}
      {showEnrichmentStatus && enrichmentStatus && (
        <Badge 
          variant={enrichmentConfig.variant}
          className={cn(enrichmentConfig.className, "text-xs")}
        >
          <EnrichmentIcon 
            className={cn(
              "h-3 w-3 mr-1", 
              enrichmentConfig.animate && "animate-spin"
            )} 
          />
          {enrichmentConfig.label}
        </Badge>
      )}
    </div>
  );
}

// Individual badge components for more granular use
export function AIFitScoreBadge({ score }: { score?: number | null }) {
  if (score === undefined || score === null) return null;
  
  return (
    <Badge variant={getFitBadgeVariant(score)}>
      <Zap className="h-3 w-3 mr-1" />
      Fit {score}%
    </Badge>
  );
}

export function PipelineStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  
  const displayStatus = STAGE_LABEL[status] || status;
  return (
    <Badge variant="outline">
      {displayStatus}
    </Badge>
  );
}

export function EnrichmentStatusBadge({ 
  status, 
  showLabel = true 
}: { 
  status?: string; 
  showLabel?: boolean; 
}) {
  if (!status) return null;
  
  const config = getEnrichmentConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, "text-xs")}
    >
      <Icon 
        className={cn(
          "h-3 w-3", 
          showLabel && "mr-1",
          config.animate && "animate-spin"
        )} 
      />
      {showLabel && config.label}
    </Badge>
  );
}