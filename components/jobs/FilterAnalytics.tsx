import { useEffect } from 'react';
import { SmartFilterState } from './SmartFilters';

interface FilterAnalyticsProps {
  filters: SmartFilterState;
  searchTerm: string;
  resultsCount: number;
  totalCount: number;
}

// Simple client-side analytics for filter usage
export function FilterAnalytics({ filters, searchTerm, resultsCount, totalCount }: FilterAnalyticsProps) {
  useEffect(() => {
    // Track filter usage patterns
    const activeFilters = Object.entries(filters).filter(([, value]) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value > 0;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.length > 0;
      return false;
    });

    if (activeFilters.length > 0 || searchTerm) {
      // Store filter analytics in localStorage for demo purposes
      const analytics = JSON.parse(localStorage.getItem('filterAnalytics') || '{}');
      
      const timestamp = new Date().toISOString();
      const sessionKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      analytics[sessionKey] = {
        timestamp,
        activeFilters: activeFilters.map(([key, value]) => ({ key, value })),
        searchTerm,
        resultsCount,
        totalCount,
        filterEfficiency: totalCount > 0 ? ((totalCount - resultsCount) / totalCount) * 100 : 0,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      };
      
      // Keep only last 100 sessions
      const entries = Object.entries(analytics);
      if (entries.length > 100) {
        const recent = entries.slice(-100);
        const newAnalytics = Object.fromEntries(recent);
        localStorage.setItem('filterAnalytics', JSON.stringify(newAnalytics));
      } else {
        localStorage.setItem('filterAnalytics', JSON.stringify(analytics));
      }
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Filter Analytics:', {
          activeFilters: activeFilters.length,
          searchTerm,
          efficiency: `${((totalCount - resultsCount) / totalCount * 100).toFixed(1)}%`,
          results: `${resultsCount}/${totalCount}`
        });
      }
    }
  }, [filters, searchTerm, resultsCount, totalCount]);

  // This component doesn't render anything, it just tracks analytics
  return null;
}

// Hook to get filter analytics data
export function useFilterAnalytics() {
  const getAnalytics = () => {
    try {
      return JSON.parse(localStorage.getItem('filterAnalytics') || '{}');
    } catch {
      return {};
    }
  };

  const getAnalyticsSummary = () => {
    const analytics = getAnalytics();
    const entries = Object.values(analytics) as any[];
    
    if (entries.length === 0) return null;

    const totalSessions = entries.length;
    const avgResultsPerSession = entries.reduce((sum, entry) => sum + entry.resultsCount, 0) / totalSessions;
    const avgFilterEfficiency = entries.reduce((sum, entry) => sum + entry.filterEfficiency, 0) / totalSessions;
    
    const mostUsedFilters = entries
      .flatMap(entry => entry.activeFilters.map((f: any) => f.key))
      .reduce((acc, filter) => {
        acc[filter] = (acc[filter] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topFilters = Object.entries(mostUsedFilters)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    return {
      totalSessions,
      avgResultsPerSession: Math.round(avgResultsPerSession),
      avgFilterEfficiency: Math.round(avgFilterEfficiency),
      topFilters
    };
  };

  const clearAnalytics = () => {
    localStorage.removeItem('filterAnalytics');
  };

  return {
    getAnalytics,
    getAnalyticsSummary,
    clearAnalytics
  };
}