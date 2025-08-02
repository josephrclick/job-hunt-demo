import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DimensionalScoresProps {
  scores: {
    culture_fit_score?: number;
    growth_potential_score?: number;
    work_life_balance_score?: number;
    compensation_competitiveness_score?: number;
    overall_recommendation_score?: number;
  };
  variant?: 'compact' | 'detailed';
  className?: string;
}

const DIMENSION_INFO = {
  culture_fit_score: {
    label: 'Culture',
    icon: '🤝',
    description: 'How well the company culture aligns with your preferences'
  },
  growth_potential_score: {
    label: 'Growth',
    icon: '📈',
    description: 'Career advancement and learning opportunities'
  },
  work_life_balance_score: {
    label: 'Balance',
    icon: '⚖️',
    description: 'Work-life balance and flexibility'
  },
  compensation_competitiveness_score: {
    label: 'Comp',
    icon: '💰',
    description: 'Compensation relative to market and your expectations'
  },
  overall_recommendation_score: {
    label: 'Overall',
    icon: '⭐',
    description: 'Overall recommendation based on all factors'
  }
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function DimensionalScores({ scores, variant = 'compact', className }: DimensionalScoresProps) {
  // Filter out null/undefined scores
  const validScores = Object.entries(scores).filter(([_, score]) => score !== null && score !== undefined);
  
  if (validScores.length === 0) return null;

  if (variant === 'compact') {
    // Compact view for JobCardV2 - just show overall score prominently
    const overallScore = scores.overall_recommendation_score;
    if (!overallScore) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              <span className="text-xs text-muted-foreground">Match:</span>
              <span className={cn("text-sm font-semibold", getScoreColor(overallScore))}>
                {overallScore}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {validScores.map(([key, score]) => {
                const info = DIMENSION_INFO[key as keyof typeof DIMENSION_INFO];
                if (!info || score === null || score === undefined) return null;
                return (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span>{info.icon}</span>
                    <span>{info.label}:</span>
                    <span className={cn("font-medium", getScoreColor(score))}>{score}%</span>
                  </div>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed view for JobMasterDetail
  return (
    <div className={cn("space-y-3", className)}>
      {validScores.map(([key, score]) => {
        const info = DIMENSION_INFO[key as keyof typeof DIMENSION_INFO];
        if (!info || score === null || score === undefined) return null;

        return (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1 cursor-help">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{info.icon}</span>
                      <span className="text-sm font-medium">{info.label}</span>
                    </div>
                    <span className={cn("text-sm font-semibold", getScoreColor(score))}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={cn("h-2 rounded-full transition-all", getScoreBarColor(score))}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{info.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}