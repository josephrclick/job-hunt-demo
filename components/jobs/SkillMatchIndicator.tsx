import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillMatchIndicatorProps {
  skillCoveragePct?: number;
  skillsMatched?: string[];
  skillsGap?: string[];
  maxSkillsShown?: number;
  showSkills?: boolean;
  className?: string;
}

export function SkillMatchIndicator({
  skillCoveragePct,
  skillsMatched = [],
  skillsGap = [],
  maxSkillsShown = 2,
  showSkills = true,
  className
}: SkillMatchIndicatorProps) {
  // Handle cases where skill coverage is not available
  if (skillCoveragePct === null || skillCoveragePct === undefined) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-xs text-muted-foreground">Skill analysis pending...</div>
      </div>
    );
  }

  // Color scheme handled by CSS classes below

  const getTextColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const displayedMatched = skillsMatched.slice(0, maxSkillsShown);
  const displayedGap = skillsGap.slice(0, maxSkillsShown);
  const remainingMatched = Math.max(0, skillsMatched.length - maxSkillsShown);
  const remainingGap = Math.max(0, skillsGap.length - maxSkillsShown);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress bar with percentage */}
      <div className="flex items-center gap-2">
        <span className={cn("text-sm font-semibold", getTextColor(skillCoveragePct))}>
          Skill Match: {skillCoveragePct}%
        </span>
        <div className="flex-1">
          <Progress 
            value={skillCoveragePct} 
            className="h-2"
            style={{
              backgroundColor: "hsl(var(--muted))"
            }}
          />
          <style jsx>{`
            .bg-green-500 {
              background-color: hsl(142 76% 36%);
            }
            .bg-yellow-500 {
              background-color: hsl(45 93% 47%);
            }
            .bg-red-500 {
              background-color: hsl(0 84% 60%);
            }
          `}</style>
        </div>
      </div>

      {/* Skills badges */}
      {showSkills && (displayedMatched.length > 0 || displayedGap.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {/* Matched skills */}
          {displayedMatched.map((skill) => (
            <Badge
              key={`matched-${skill}`}
              variant="default"
              className="text-xs bg-green-100 text-green-800 hover:bg-green-200"
            >
              ✓ {skill}
            </Badge>
          ))}
          
          {/* Gap skills */}
          {displayedGap.map((skill) => (
            <Badge
              key={`gap-${skill}`}
              variant="outline"
              className="text-xs border-red-200 text-red-700"
            >
              ✗ {skill}
            </Badge>
          ))}

          {/* Show remaining count */}
          {remainingMatched > 0 && (
            <Badge variant="secondary" className="text-xs">
              +{remainingMatched} more
            </Badge>
          )}
          
          {remainingGap > 0 && (
            <Badge variant="outline" className="text-xs">
              +{remainingGap} to learn
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}