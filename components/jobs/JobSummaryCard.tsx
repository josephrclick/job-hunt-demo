import React, { useState } from 'react';
import { JobDisplay } from '@/app/types/job';
import { CheckCircle2, DollarSign, CheckSquare, Archive } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  job: JobDisplay;
  selected: boolean;
  onSelect: (job: JobDisplay) => void;
  onStatusUpdate?: (jobId: string, status: string) => void;
}

interface ExtractedFields {
  comp_min?: number;
  comp_max?: number;
  comp_currency?: string;
  tech_stack?: string[];
  experience_years_min?: number;
  experience_years_max?: number;
  remote_policy?: string;
  travel_required?: string;
}

/**
 * JobSummaryCard – minimal, clean card for job listing sidebar.
 * Shows only essential info: company, title, salary, and AI fit score.
 */
export default function JobSummaryCard({ job, selected, onSelect, onStatusUpdate }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  // Use ai_fit_score if available, otherwise skill_coverage_pct
  const aiFitScore = job.ai_fit_score ?? job.enrichment?.skill_coverage_pct;
  
  const enrichment = job.enrichment ?? {};
  const extracted = (enrichment.extracted_fields || {}) as ExtractedFields;
  
  // Format salary display (same logic as JobDetailTabs)
  const formatSalary = () => {
    if (job.salary) return job.salary;
    if (enrichment.comp_range) return enrichment.comp_range;
    if (extracted.comp_min && extracted.comp_max) {
      return `$${extracted.comp_min?.toLocaleString()} - $${extracted.comp_max?.toLocaleString()}`;
    }
    return 'Not specified';
  };

  // Handle status updates
  const handleStatusUpdate = async (newStatus: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card selection
    
    if (!onStatusUpdate || isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      await onStatusUpdate(job.id, newStatus);
      
      // Show success toast
      toast({
        title: "Status updated",
        description: `Job marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update job status:', error);
      
      // Show error toast
      toast({
        title: "Unable to update job",
        description: error instanceof Error ? error.message : 'Your account lacks permission to perform this action',
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className={`
        cursor-pointer p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50 mb-2
        ${selected 
          ? 'bg-muted/30 border-primary/50 border-l-4 border-l-primary shadow-sm' 
          : 'bg-card border-border hover:border-muted-foreground/30'
        }
      `}
    >
      {/* Company name - most prominent */}
      <h3 className={`font-semibold text-base mb-1 ${selected ? 'text-primary' : 'text-foreground'}`}>
        {job.company}
      </h3>

      {/* Job title - secondary */}
      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
        {job.title}
      </p>

      {/* Bottom row - AI Fit Score and Salary */}
      <div className="flex items-center justify-between mb-2">
        {/* AI Fit Score */}
        {aiFitScore && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span className="text-xs font-medium">{aiFitScore}% fit</span>
          </div>
        )}
        
        {/* Salary */}
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-success" />
          <span className="text-xs text-muted-foreground">
            {formatSalary()}
          </span>
        </div>
      </div>

      {/* Action buttons - only show if onStatusUpdate is provided and not already applied/archived */}
      {onStatusUpdate && job.status !== 'applied' && job.status !== 'archived' && (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => handleStatusUpdate('applied', e)}
            disabled={isUpdating}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded-md transition-colors disabled:opacity-50"
            title="Mark as Applied"
          >
            <CheckSquare className="h-3 w-3" />
            Applied
          </button>
          <button
            onClick={(e) => handleStatusUpdate('archived', e)}
            disabled={isUpdating}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors disabled:opacity-50"
            title="Archive Job"
          >
            <Archive className="h-3 w-3" />
            Archive
          </button>
        </div>
      )}

      {/* Show current status if applied/archived */}
      {(job.status === 'applied' || job.status === 'archived') && (
        <div className="flex justify-end">
          <span className={`text-xs px-2 py-1 rounded-md ${
            job.status === 'applied' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {job.status === 'applied' ? 'Applied' : 'Archived'}
          </span>
        </div>
      )}
    </div>
  );
} 