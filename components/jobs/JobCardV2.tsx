import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Loader2, AlertTriangle, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { JobDisplay } from "@/app/types/job";
import { SkillMatchIndicator } from "./SkillMatchIndicator";
import { DealbreakerBadge } from "./DealbreakerBadge";
import { SalaryDisplay } from "./SalaryDisplay";
import { DimensionalScores } from "./DimensionalScores";
import { cn } from "@/lib/utils";
import { getStageLabel, InterviewStage } from "@/types/interview";

interface JobCardV2Props {
  job: JobDisplay;
  onStatusChange: (jobId: string, newStatus: string) => void;
  onApply: (job: JobDisplay) => void;
  onGenerateCoverLetter: (job: JobDisplay) => void;
  onCardClick: (job: JobDisplay) => void;
  className?: string;
}

const STAGES = [
  "new",
  "interested",
  "applied", 
  "recruiter_screen",
  "hiring_manager",
  "peer",
  "panel_mock_demo",
  "offer",
  "rejected",
];

const STAGE_LABEL: Record<string, string> = {
  new: "New",
  interested: "Interested",
  applied: "Applied",
  recruiter_screen: "Recruiter Screen", 
  hiring_manager: "Hiring Manager",
  peer: "Peer",
  panel_mock_demo: "Panel/Mock/Demo",
  offer: "Offer",
  rejected: "Rejected",
};

export function JobCardV2({
  job,
  onStatusChange,
  onApply,
  onGenerateCoverLetter,
  onCardClick,
  className
}: JobCardV2Props) {
  const isEnrichmentPending = job.enrichment_status === 'pending' || job.enrichment_status === 'processing';
  const isEnrichmentFailed = job.enrichment_status === 'failed';
  const hasEnrichmentData = job.enrichment_status === 'completed' && job.enrichment;

  // Don't show low confidence enrichments
  const showEnrichmentData = hasEnrichmentData && (
    !job.enrichment?.confidence_score || job.enrichment.confidence_score > 30
  );

  // Check for v2 enrichment data
  const hasV2Data = showEnrichmentData && job.enrichment?.overall_recommendation_score !== undefined;
  const hasImplicitRisks = job.enrichment?.risks && Object.keys(job.enrichment.risks).length > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, select, [role="button"]')) {
      return;
    }
    onCardClick(job);
  };

  const getRemotePolicyBadge = (policy?: string) => {
    if (!policy) return null;
    
    const variants: Record<string, { variant: "default" | "secondary" | "outline", color: string }> = {
      'remote': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'hybrid': { variant: 'secondary', color: 'bg-blue-100 text-blue-800' },
      'onsite': { variant: 'outline', color: 'bg-gray-100 text-gray-800' },
    };

    const config = variants[policy.toLowerCase()] || { variant: 'outline' as const, color: '' };
    
    return (
      <Badge variant={config.variant} className={cn("text-xs", config.color)}>
        {policy.charAt(0).toUpperCase() + policy.slice(1)}
      </Badge>
    );
  };

  return (
    <Card
      className={cn(
        "relative group hover:shadow-lg hover:ring-2 hover:ring-primary/20 cursor-pointer transition-all",
        "h-[140px] flex flex-col",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2 px-4 pt-3 flex-shrink-0">
        {/* Title and Salary Row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight line-clamp-1 flex-1">
            {job.title}
          </h3>
          <div className="flex items-center gap-2">
            {hasV2Data && (
              <DimensionalScores
                scores={{
                  overall_recommendation_score: job.enrichment?.overall_recommendation_score
                }}
                variant="compact"
                className="flex-shrink-0"
              />
            )}
            <SalaryDisplay 
              compRange={job.enrichment?.comp_range}
              className="flex-shrink-0"
            />
          </div>
        </div>

        {/* Company and Meta Info Row */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Briefcase className="h-3 w-3" />
            <span className="font-medium">{job.company}</span>
            {job.enrichment?.remote_policy && getRemotePolicyBadge(job.enrichment.remote_policy)}
            {job.current_interview_stage && job.current_interview_stage !== 'not_started' && (
              <Badge variant="secondary" className="text-xs h-5 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {getStageLabel(job.current_interview_stage as InterviewStage)}
              </Badge>
            )}
          </div>
          <span>
            {job.posted_date
              ? formatDistanceToNow(new Date(job.posted_date)) + " ago"
              : "Recently posted"
            }
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 flex-1 flex flex-col justify-between">
        {/* Risk Indicators - Dealbreakers and Implicit Risks */}
        <div className="space-y-1">
          {showEnrichmentData && job.enrichment?.dealbreaker_hit && (
            <DealbreakerBadge
              dealbreakerHit={job.enrichment.dealbreaker_hit}
              extractedFields={job.enrichment.extracted_fields}
            />
          )}
          
          {hasImplicitRisks && (
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-3 w-3" />
              <span>Risk factors detected</span>
            </div>
          )}
        </div>

        {/* Enrichment Status Section */}
        <div className="flex-1 min-h-0">
          {isEnrichmentPending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Analyzing job...</span>
            </div>
          )}

          {isEnrichmentFailed && (
            <div className="text-xs text-muted-foreground">
              Could not analyze
            </div>
          )}

          {showEnrichmentData && (
            <SkillMatchIndicator
              skillCoveragePct={job.enrichment?.skill_coverage_pct}
              skillsMatched={job.enrichment?.skills_matched}
              skillsGap={job.enrichment?.skills_gap}
              maxSkillsShown={2}
              showSkills={true}
            />
          )}
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
          <Select
            value={job.status}
            onValueChange={(value) => onStatusChange(job.id, value)}
          >
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((stage) => (
                <SelectItem key={stage} value={stage} className="text-xs">
                  {STAGE_LABEL[stage]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onApply(job);
            }}
          >
            Apply
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onGenerateCoverLetter(job);
            }}
          >
            Cover
          </Button>

          {/* Interview status indicator */}
          {job.interview_status && job.interview_status !== 'not_applied' && (
            <div className={cn(
              "w-2 h-2 rounded-full",
              job.interview_status === 'in_progress' && "bg-blue-500",
              job.interview_status === 'scheduled' && "bg-yellow-500",
              job.interview_status === 'completed' && "bg-green-500",
              job.interview_status === 'offer_received' && "bg-purple-500",
              job.interview_status === 'rejected' && "bg-red-500"
            )} title={`Interview: ${job.interview_status.replace(/_/g, ' ')}`} />
          )}

          {/* Confidence indicator */}
          {showEnrichmentData && job.enrichment?.confidence_score && (
            <div className="ml-auto">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs h-5",
                  job.enrichment.confidence_score > 70 ? "border-green-300 text-green-700" :
                  job.enrichment.confidence_score > 50 ? "border-yellow-300 text-yellow-700" :
                  "border-gray-300 text-gray-600"
                )}
              >
                {job.enrichment.confidence_score}%
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}