import { useState, useEffect, useCallback } from 'react';
import { InterviewRound, InterviewRoundInsert, InterviewRoundUpdate, InterviewTemplate } from '@/types/interview';
import { useOptimisticUpdate, useBatchOptimisticUpdate } from './useOptimisticUpdate';
import { toast } from 'sonner';

// Fetch interview rounds for a job
export function useInterviewRounds(jobId: string) {
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRounds = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/${jobId}/interviews`);
      if (!response.ok) throw new Error('Failed to fetch interview rounds');
      
      const data = await response.json();
      setRounds(data.rounds || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to load interview rounds');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchRounds();
    }
  }, [jobId, fetchRounds]);

  return { rounds, isLoading, error, refetch: fetchRounds };
}

// Create a new interview round
export function useCreateInterviewRound(jobId: string) {
  const [isCreating, setIsCreating] = useState(false);

  const createRound = useCallback(async (round: Omit<InterviewRoundInsert, 'job_id' | 'profile_uid'>) => {
    setIsCreating(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(round)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create interview round');
      }

      const data = await response.json();
      toast.success('Interview round created');
      return data.round;
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [jobId]);

  return { createRound, isCreating };
}

// Update an interview round with optimistic updates
export function useUpdateInterviewRound(jobId: string, roundId: string) {
  const updateFn = useCallback(async (updates: InterviewRoundUpdate) => {
    const response = await fetch(`/api/jobs/${jobId}/interviews/${roundId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update interview round');
    }

    const data = await response.json();
    return data.round;
  }, [jobId, roundId]);

  return useOptimisticUpdate<InterviewRound>({
    updateFn,
    successMessage: 'Interview updated',
    errorMessage: 'Failed to update interview'
  });
}

// Delete an interview round
export function useDeleteInterviewRound(jobId: string) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteRound = useCallback(async (roundId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/interviews/${roundId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete interview round');
      }

      toast.success('Interview round deleted');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [jobId]);

  return { deleteRound, isDeleting };
}

// Bulk operations for interview rounds
export function useBulkInterviewOperations(jobId: string) {
  const batchUpdate = useBatchOptimisticUpdate<InterviewRound>();

  const applyTemplate = useCallback(async (template: InterviewTemplate['name']) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/interviews/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply template');
      }

      const data = await response.json();
      toast.success(`Applied ${template} interview template`);
      return data.rounds;
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      throw error;
    }
  }, [jobId]);

  const bulkUpdateRounds = useCallback(async (roundIds: string[], updates: Partial<InterviewRoundUpdate>) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/interviews/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundIds, updates })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update rounds');
      }

      const data = await response.json();
      toast.success(`Updated ${data.rounds.length} rounds`);
      return data.rounds;
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      throw error;
    }
  }, [jobId]);

  const bulkDeleteRounds = useCallback(async (roundIds: string[]) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/interviews/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundIds })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete rounds');
      }

      toast.success(`Deleted ${roundIds.length} rounds`);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      throw error;
    }
  }, [jobId]);

  return {
    ...batchUpdate,
    applyTemplate,
    bulkUpdateRounds,
    bulkDeleteRounds
  };
}

// Fetch interview timeline
export function useInterviewTimeline(days: number = 30) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeline = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/interviews/timeline?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch interview timeline');
      
      const data = await response.json();
      setTimeline(data.timeline || []);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to load interview timeline');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return { timeline, stats, isLoading, error, refetch: fetchTimeline };
}