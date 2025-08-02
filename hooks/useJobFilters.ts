'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JobDisplay } from '@/app/types/job';
import { SmartFilterState } from '@/components/jobs/SmartFilters';

// Fuzzy search function for better matching
function fuzzyMatch(text: string, searchTerm: string): boolean {
  if (!searchTerm) return true;
  const searchWords = searchTerm.toLowerCase().split(' ').filter(Boolean);
  const targetText = text.toLowerCase();
  
  return searchWords.every(word => 
    targetText.includes(word) || 
    // Allow partial matches (min 3 chars)
    (word.length >= 3 && targetText.includes(word.slice(0, -1)))
  );
}

// Advanced search scoring for relevance ranking
function calculateRelevanceScore(job: JobDisplay, searchTerm: string): number {
  if (!searchTerm) return 1;
  
  const searchLower = searchTerm.toLowerCase();
  let score = 0;
  
  // Title match (highest weight)
  if (job.title.toLowerCase().includes(searchLower)) score += 10;
  
  // Company match
  if (job.company.toLowerCase().includes(searchLower)) score += 5;
  
  // Skills match
  if (job.skills?.some(skill => skill.toLowerCase().includes(searchLower))) score += 3;
  
  // Description match (lowest weight)
  if (job.description?.toLowerCase().includes(searchLower)) score += 1;
  
  return score;
}

export function useJobFilters(jobs: JobDisplay[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<SmartFilterState>(() => {
    // Default values for SSR compatibility
    const defaultFilters = {
      hideRuleouts: false,
      minSalary: undefined,
      maxSalary: undefined,
      remotePolicies: [],
      minConfidence: 0,
      company: undefined,
      status: undefined,
      postedAfter: undefined,
      title: undefined,
      minFitScore: undefined,
    };

    // Only parse URL params on client side
    if (typeof window === 'undefined') {
      return defaultFilters;
    }

    const urlFilters: Partial<SmartFilterState> = {};
    
    // Parse URL parameters safely
    try {
      if (searchParams.get('hideRuleouts') === 'true') urlFilters.hideRuleouts = true;
      if (searchParams.get('minSalary')) urlFilters.minSalary = parseInt(searchParams.get('minSalary')!);
      if (searchParams.get('maxSalary')) urlFilters.maxSalary = parseInt(searchParams.get('maxSalary')!);
      if (searchParams.get('remotePolicies')) urlFilters.remotePolicies = searchParams.get('remotePolicies')!.split(',');
      if (searchParams.get('minConfidence')) urlFilters.minConfidence = parseInt(searchParams.get('minConfidence')!);
      if (searchParams.get('company')) urlFilters.company = searchParams.get('company')!;
      if (searchParams.get('status')) urlFilters.status = searchParams.get('status')!;
      if (searchParams.get('title')) urlFilters.title = searchParams.get('title')!;
      if (searchParams.get('minFitScore')) urlFilters.minFitScore = parseInt(searchParams.get('minFitScore')!);
    } catch (e) {
      console.warn('Error parsing URL parameters:', e);
    }
    
    return {
      ...defaultFilters,
      ...urlFilters
    };
  });
  
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window === 'undefined') return '';
    return searchParams.get('search') || '';
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Update URL when filters change
  const updateURL = useCallback((newFilters: SmartFilterState, newSearchTerm?: string) => {
    const params = new URLSearchParams();
    
    // Add non-default filter values to URL
    if (newFilters.hideRuleouts) params.set('hideRuleouts', 'true');
    if (newFilters.minSalary) params.set('minSalary', newFilters.minSalary.toString());
    if (newFilters.maxSalary) params.set('maxSalary', newFilters.maxSalary.toString());
    if (newFilters.remotePolicies.length > 0) params.set('remotePolicies', newFilters.remotePolicies.join(','));
    if (newFilters.minConfidence > 0) params.set('minConfidence', newFilters.minConfidence.toString());
    if (newFilters.company) params.set('company', newFilters.company);
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.title) params.set('title', newFilters.title);
    if (newFilters.minFitScore) params.set('minFitScore', newFilters.minFitScore.toString());
    
    if (newSearchTerm !== undefined && newSearchTerm) params.set('search', newSearchTerm);
    
    const newURL = params.toString() ? `?${params.toString()}` : '/jobs';
    router.replace(newURL, { scroll: false });
  }, [router]);
  
  // Filter update function
  const updateFilters = useCallback((newFilters: SmartFilterState) => {
    setFilters(newFilters);
    updateURL(newFilters, searchTerm);
    
    // Store in localStorage for persistence across sessions
    localStorage.setItem('jobFilters', JSON.stringify(newFilters));
  }, [updateURL, searchTerm]);
  
  // Search update function
  const updateSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    updateURL(filters, newSearchTerm);
  }, [updateURL, filters]);
  
  // Extract unique companies for filter dropdown
  const companies = useMemo(() => {
    const uniqueCompanies = Array.from(new Set(jobs.map(job => job.company)))
      .filter(Boolean)
      .sort();
    return uniqueCompanies;
  }, [jobs]);
  
  // Advanced filtering logic
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      // AI-powered filters
      if (filters.hideRuleouts && job.enrichment?.dealbreaker_hit) {
        return false;
      }
      
      
      if (filters.minConfidence > 0) {
        const confidence = job.enrichment?.confidence_score || 0;
        if (confidence < filters.minConfidence) return false;
      }
      
      // Salary filters - match the same priority order as display logic
      if (filters.minSalary) {
        let jobMinSalary = 0;
        
        // Priority 1: job.salary (string format like "$100,000 - $130,000")
        if (job.salary) {
          const salaryNumbers = job.salary.match(/\d+(?:,\d{3})*/g);
          if (salaryNumbers) {
            jobMinSalary = parseInt(salaryNumbers[0].replace(/,/g, ''));
          }
        }
        // Priority 2: enrichment.comp_range (string format)
        else if (job.enrichment?.comp_range) {
          const salaryNumbers = job.enrichment.comp_range.match(/\d+(?:,\d{3})*/g);
          if (salaryNumbers) {
            jobMinSalary = parseInt(salaryNumbers[0].replace(/,/g, ''));
          }
        }
        // Priority 3: extracted_fields.comp_min (from enrichment.extracted_fields)
        else if (job.enrichment?.extracted_fields) {
          const extracted = job.enrichment.extracted_fields as any;
          jobMinSalary = extracted.comp_min || 0;
        }
        // Priority 4: Direct enrichment comp_min
        else if (job.enrichment?.comp_min) {
          jobMinSalary = job.enrichment.comp_min;
        }
        
        // Debug logging in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Salary filter debug for ${job.company}:`, {
            filterMinSalary: filters.minSalary,
            jobMinSalary,
            jobSalary: job.salary,
            compRange: job.enrichment?.comp_range,
            extractedCompMin: (job.enrichment?.extracted_fields as any)?.comp_min,
            enrichmentCompMin: job.enrichment?.comp_min,
            shouldFilter: jobMinSalary > 0 && jobMinSalary < filters.minSalary
          });
        }
        
        // Only filter out if we have a valid salary to compare
        if (jobMinSalary > 0 && jobMinSalary < filters.minSalary) return false;
      }
      
      if (filters.maxSalary) {
        let jobMaxSalary = 0;
        
        // Priority 1: job.salary (string format like "$100,000 - $130,000")
        if (job.salary) {
          const salaryNumbers = job.salary.match(/\d+(?:,\d{3})*/g);
          if (salaryNumbers && salaryNumbers.length > 1) {
            // Take the second number as the maximum (e.g., "$100,000 - $130,000" -> 130000)
            jobMaxSalary = parseInt(salaryNumbers[1].replace(/,/g, ''));
          } else if (salaryNumbers && salaryNumbers.length === 1) {
            // If only one number, use it as both min and max
            jobMaxSalary = parseInt(salaryNumbers[0].replace(/,/g, ''));
          }
        }
        // Priority 2: enrichment.comp_range (string format)
        else if (job.enrichment?.comp_range) {
          const salaryNumbers = job.enrichment.comp_range.match(/\d+(?:,\d{3})*/g);
          if (salaryNumbers && salaryNumbers.length > 1) {
            jobMaxSalary = parseInt(salaryNumbers[1].replace(/,/g, ''));
          } else if (salaryNumbers && salaryNumbers.length === 1) {
            jobMaxSalary = parseInt(salaryNumbers[0].replace(/,/g, ''));
          }
        }
        // Priority 3: extracted_fields.comp_max (from enrichment.extracted_fields)
        else if (job.enrichment?.extracted_fields) {
          const extracted = job.enrichment.extracted_fields as any;
          jobMaxSalary = extracted.comp_max || 0;
        }
        // Priority 4: Direct enrichment comp_max
        else if (job.enrichment?.comp_max) {
          jobMaxSalary = job.enrichment.comp_max;
        }
        
        // Only filter out if we have a valid salary to compare
        if (jobMaxSalary > 0 && jobMaxSalary > filters.maxSalary) return false;
      }
      
      // Remote policy filter
      if (filters.remotePolicies.length > 0) {
        const jobRemotePolicy = (job.enrichment?.remote_policy || job.location || '').toLowerCase();
        const hasMatchingPolicy = filters.remotePolicies.some(policy => {
          switch (policy) {
            case 'remote':
              return jobRemotePolicy.includes('remote') || jobRemotePolicy.includes('anywhere') || jobRemotePolicy.includes('fully remote');
            case 'hybrid':
              return jobRemotePolicy.includes('hybrid');
            case 'onsite':
              return jobRemotePolicy.includes('on-site') || jobRemotePolicy.includes('onsite') || 
                     (!jobRemotePolicy.includes('remote') && !jobRemotePolicy.includes('hybrid'));
            default:
              return false;
          }
        });
        if (!hasMatchingPolicy) return false;
      }
      
      // Standard filters
      if (filters.company && job.company !== filters.company) return false;
      if (filters.status && job.status !== filters.status) return false;
      if (filters.minFitScore && (job.ai_fit_score || 0) < filters.minFitScore) return false;
      
      if (filters.postedAfter) {
        const jobDate = job.posted_date || job.scraped_at;
        if (jobDate) {
          const postedDate = new Date(jobDate);
          const filterDate = new Date(filters.postedAfter);
          if (postedDate < filterDate) return false;
        }
      }
      
      // Title filter (fuzzy matching)
      if (filters.title && !fuzzyMatch(job.title, filters.title)) return false;
      
      return true;
    });
    
    // Apply search filter with fuzzy matching
    if (debouncedSearchTerm) {
      filtered = filtered.filter(job => 
        fuzzyMatch(job.title, debouncedSearchTerm) ||
        fuzzyMatch(job.company, debouncedSearchTerm) ||
        (job.skills && job.skills.some(skill => fuzzyMatch(skill, debouncedSearchTerm))) ||
        (job.description && fuzzyMatch(job.description, debouncedSearchTerm))
      );
      
      // Sort by relevance when searching
      filtered.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, debouncedSearchTerm);
        const scoreB = calculateRelevanceScore(b, debouncedSearchTerm);
        return scoreB - scoreA;
      });
    } else {
      // Default sorting by AI fit score when not searching
      filtered.sort((a, b) => (b.ai_fit_score || 0) - (a.ai_fit_score || 0));
    }
    
    return filtered;
  }, [jobs, filters, debouncedSearchTerm]);
  
  // Filter statistics for analytics
  const filterStats = useMemo(() => ({
    totalJobs: jobs.length,
    filteredJobs: filteredJobs.length,
    hiddenJobs: jobs.length - filteredJobs.length,
    filterEfficiency: jobs.length > 0 ? ((jobs.length - filteredJobs.length) / jobs.length) * 100 : 0
  }), [jobs.length, filteredJobs.length]);
  
  // Reset filters function
  const resetFilters = useCallback(() => {
    const defaultFilters: SmartFilterState = {
      hideRuleouts: false,
      minSalary: undefined,
      maxSalary: undefined,
      remotePolicies: [],
      minConfidence: 0,
      company: undefined,
      status: undefined,
      postedAfter: undefined,
      title: undefined,
      minFitScore: undefined,
    };
    setFilters(defaultFilters);
    setSearchTerm('');
    
    // Clear URL directly
    router.replace('/jobs', { scroll: false });
    localStorage.removeItem('jobFilters');
  }, [router]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open filters
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsFiltersOpen(true);
      }
      
      // Escape to close filters
      if (e.key === 'Escape' && isFiltersOpen) {
        setIsFiltersOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isFiltersOpen]);
  
  return {
    filters,
    updateFilters,
    searchTerm,
    updateSearch,
    debouncedSearchTerm,
    filteredJobs,
    companies,
    filterStats,
    resetFilters,
    isFiltersOpen,
    setIsFiltersOpen
  };
}