'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { JobDisplay } from "@/app/types/job";
import JobMasterDetail from "./JobMasterDetail";
import TabBar from "./TabBar";
import { CompanyVisitTracker } from "@/components/CompanyVisitTracker";
import { SmartFilters } from "./SmartFilters";
import { SmartSearch } from "./SmartSearch";
import { FilterAnalytics } from "./FilterAnalytics";
import { useJobFilters } from "@/hooks/useJobFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Users, Clock, Sparkles } from "lucide-react";

export default function JobsPageContent() {
  const [allJobs, setAllJobs] = useState<JobDisplay[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<'new' | 'applied'>('new');
  
  // Smart filtering and search
  const {
    filters,
    updateFilters,
    searchTerm,
    updateSearch,
    debouncedSearchTerm,
    filteredJobs: smartFilteredJobs,
    companies,
    filterStats,
    resetFilters,
    isFiltersOpen,
    setIsFiltersOpen
  } = useJobFilters(allJobs);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/jobs');
      
      // Check if we're being redirected to login
      if (response.redirected || response.url.includes('/auth/login')) {
        setError('Authentication required. Please log in to view jobs.');
        setAllJobs([]);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Jobs fetch error:', errorData);
        throw new Error(`Failed to fetch jobs: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Extract jobs from the API response
      const jobs = Array.isArray(data.jobs) ? data.jobs : [];
      console.log('Extracted jobs:', jobs.length, jobs);
      setAllJobs(jobs);
      
      // Auto-select first job if none selected (avoid dependency on selectedJob)
      setSelectedJob(prev => prev || (jobs.length > 0 ? jobs[0] : null));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load jobs');
      setAllJobs([]); // Ensure we always have an array, even on error
    } finally {
      setLoading(false);
    }
  }, []); // Remove selectedJob dependency

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Combine status filtering with smart filtering
  const finalFilteredJobs = useMemo(() => {
    return smartFilteredJobs.filter(job => job.status === activeStatus);
  }, [smartFilteredJobs, activeStatus]);

  // Calculate job counts for each status (based on smart filtered results)
  const jobCounts = useMemo(() => ({
    new: smartFilteredJobs.filter(job => job.status === 'new').length,
    applied: smartFilteredJobs.filter(job => job.status === 'applied').length
  }), [smartFilteredJobs]);

  // Handle selected job when switching tabs or filters
  useEffect(() => {
    if (selectedJob && !finalFilteredJobs.find(job => job.id === selectedJob.id)) {
      // Auto-select first job in the new filter, or clear selection
      setSelectedJob(finalFilteredJobs[0] || null);
    }
  }, [finalFilteredJobs, selectedJob]);
  
  // Enhanced filter stats
  const enhancedFilterStats = useMemo(() => ({
    ...filterStats,
    statusFilteredJobs: finalFilteredJobs.length,
    activeFiltersCount: Object.values(filters).filter(value => 
      value !== undefined && value !== false && value !== 0 && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length + (searchTerm ? 1 : 0)
  }), [filterStats, finalFilteredJobs.length, filters, searchTerm]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading jobs...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <button 
            onClick={fetchJobs}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      <CompanyVisitTracker />
      <div className="flex-1 flex flex-col px-12 py-6">
        {/* Filter Analytics Tracking */}
        <FilterAnalytics
          filters={filters}
          searchTerm={debouncedSearchTerm}
          resultsCount={finalFilteredJobs.length}
          totalCount={allJobs.length}
        />
        
        {/* Enhanced Header with Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <SmartSearch
                searchTerm={searchTerm}
                onSearchChange={updateSearch}
                debouncedSearchTerm={debouncedSearchTerm}
                resultsCount={finalFilteredJobs.length}
                totalCount={allJobs.length}
              />
            </div>
            
            <SmartFilters
              filters={filters}
              onChange={updateFilters}
              companies={companies}
              isOpen={isFiltersOpen}
              onOpenChange={setIsFiltersOpen}
              filterStats={enhancedFilterStats}
            />
            
            {/* Quick Stats */}
            {enhancedFilterStats.activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {enhancedFilterStats.activeFiltersCount} filter{enhancedFilterStats.activeFiltersCount !== 1 ? 's' : ''} active
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-6 px-2 text-xs hover:bg-primary/10"
                >
                  Clear
                </Button>
              </motion.div>
            )}
          </div>
          
          {/* Enhanced Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/20 rounded-lg border"
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Jobs:</span>
                <Badge variant="secondary" className="font-medium">
                  {allJobs.length}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Showing:</span>
                <Badge variant="default" className="font-medium">
                  {finalFilteredJobs.length}
                </Badge>
              </div>
              
              {enhancedFilterStats.hiddenJobs > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filtered:</span>
                  <Badge variant="outline" className="font-medium text-orange-600 border-orange-200">
                    {enhancedFilterStats.hiddenJobs}
                  </Badge>
                </div>
              )}
            </div>
            
            {debouncedSearchTerm && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Search: &ldquo;{debouncedSearchTerm}&rdquo;
                </span>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Jobs Content */}
        <div className="flex-1 bg-muted/10 rounded-lg border border-border p-4">
          {/* Tab Bar with Dynamic Counts */}
          <div className="mb-4">
            <TabBar
              tabs={[
                { label: 'New', value: 'new', count: jobCounts.new },
                { label: 'Applied', value: 'applied', count: jobCounts.applied }
              ]}
              activeValue={activeStatus}
              onChange={(value) => setActiveStatus(value as 'new' | 'applied')}
            />
          </div>
          
          {/* Enhanced Job List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeStatus}-${debouncedSearchTerm}-${enhancedFilterStats.activeFiltersCount}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {finalFilteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    {enhancedFilterStats.activeFiltersCount > 0 
                      ? "Try adjusting your filters or search terms to see more results."
                      : `No ${activeStatus} jobs available at the moment.`
                    }
                  </p>
                  {enhancedFilterStats.activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={resetFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </div>
              ) : (
                <JobMasterDetail
                  jobs={finalFilteredJobs}
                  selectedJob={selectedJob}
                  onSelectJob={setSelectedJob}
                  onJobUpdate={(jobId, updatedData) => {
                    // Update the job in allJobs array
                    setAllJobs(prevJobs => 
                      prevJobs.map(job => 
                        job.id === jobId ? { ...job, ...updatedData } : job
                      )
                    );
                    // Update selected job if it's the one being updated
                    if (selectedJob?.id === jobId) {
                      setSelectedJob(prev => prev ? { ...prev, ...updatedData } : null);
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}