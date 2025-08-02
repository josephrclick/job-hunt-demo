import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimisticUpdateOptions<T> {
  updateFn: (data: T) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T>({
  updateFn,
  onSuccess,
  onError,
  successMessage = 'Updated successfully',
  errorMessage = 'Failed to update'
}: OptimisticUpdateOptions<T>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  const update = useCallback(async (newData: T, previousData: T) => {
    setIsUpdating(true);
    setOptimisticData(newData);

    try {
      const result = await updateFn(newData);
      setOptimisticData(result);
      toast.success(successMessage);
      onSuccess?.(result);
      return result;
    } catch (error) {
      // Rollback on error
      setOptimisticData(previousData);
      const errorObj = error as Error;
      toast.error(errorMessage);
      onError?.(errorObj, previousData);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [updateFn, onSuccess, onError, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setOptimisticData(null);
  }, []);

  return {
    optimisticData,
    isUpdating,
    update,
    reset
  };
}

// Batch optimistic updates for multiple items
export function useBatchOptimisticUpdate<T extends { id: string }>() {
  const [optimisticItems, setOptimisticItems] = useState<Map<string, T>>(new Map());
  const [isUpdating, setIsUpdating] = useState(false);

  const updateItem = useCallback((item: T) => {
    setOptimisticItems(prev => {
      const next = new Map(prev);
      next.set(item.id, item);
      return next;
    });
  }, []);

  const updateItems = useCallback((items: T[]) => {
    setOptimisticItems(prev => {
      const next = new Map(prev);
      items.forEach(item => next.set(item.id, item));
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setOptimisticItems(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const commitUpdates = useCallback(async (
    commitFn: (items: T[]) => Promise<T[]>,
    onSuccess?: (items: T[]) => void,
    onError?: (error: Error) => void
  ) => {
    const itemsToCommit = Array.from(optimisticItems.values());
    if (itemsToCommit.length === 0) return;

    setIsUpdating(true);
    const previousItems = new Map(optimisticItems);

    try {
      const result = await commitFn(itemsToCommit);
      toast.success(`Updated ${result.length} items`);
      onSuccess?.(result);
      setOptimisticItems(new Map());
      return result;
    } catch (error) {
      // Rollback
      setOptimisticItems(previousItems);
      const errorObj = error as Error;
      toast.error('Failed to save changes');
      onError?.(errorObj);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [optimisticItems]);

  const reset = useCallback(() => {
    setOptimisticItems(new Map());
  }, []);

  return {
    optimisticItems,
    isUpdating,
    updateItem,
    updateItems,
    removeItem,
    commitUpdates,
    reset,
    hasChanges: optimisticItems.size > 0
  };
}