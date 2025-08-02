import React from 'react';
import JobSummaryCard from './JobSummaryCard';
import JobDetailTabs from './JobDetailTabs';
import { JobDisplay } from '@/app/types/job';

interface Props {
  jobs: JobDisplay[];
  selectedJob: JobDisplay | null;
  onSelectJob: (job: JobDisplay) => void;
  onJobUpdate?: (jobId: string, updatedData: Partial<JobDisplay>) => void;
}

export default function JobMasterDetail({ jobs, selectedJob, onSelectJob, onJobUpdate }: Props) {
  // Defensive programming - ensure jobs is always an array
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  
  // Handle job updates
  const handleJobUpdate = (updatedData: Partial<JobDisplay>) => {
    if (selectedJob && onJobUpdate) {
      onJobUpdate(selectedJob.id, updatedData);
    }
  };

  // Handle status updates from job cards
  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: jobId, status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Create a user-friendly error message
        const errorMessage = errorData.code === 'PERMISSION_DENIED' 
          ? errorData.message 
          : errorData.error || 'Your account lacks permission to perform this action';
        
        throw new Error(errorMessage);
      }

      // Update the job in the parent component
      if (onJobUpdate) {
        onJobUpdate(jobId, { status: newStatus });
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error; // Re-throw to let the card handle the error
    }
  };
  
  return (
    <div className="flex h-full w-full gap-4">
      {/* List pane - reduced from w-1/3 (33%) to ~23% */}
      <div className="w-[23%] h-full overflow-y-auto pr-2 border-r">
        {safeJobs.map((job) => (
          <JobSummaryCard
            key={job.id}
            job={job}
            selected={selectedJob?.id === job.id}
            onSelect={onSelectJob}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
        {safeJobs.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No jobs available.</p>
        )}
      </div>

      {/* Detail pane */}
      <div className="flex-1 h-full overflow-y-auto">
        {selectedJob ? (
          <JobDetailTabs job={selectedJob} onJobUpdate={handleJobUpdate} />
        ) : (
          <div className="p-4 text-muted-foreground">Select a job to view details</div>
        )}
      </div>
    </div>
  );
} 