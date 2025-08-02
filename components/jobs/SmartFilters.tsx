import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X, Search, Zap, TrendingUp, Sparkles, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SmartFilterState {
  hideRuleouts: boolean;
  minSalary: number | undefined;
  maxSalary: number | undefined;
  remotePolicies: string[];
  minConfidence: number;
  company?: string;
  status?: string;
  postedAfter?: string;
  title?: string;
  minFitScore?: number;
}

interface SmartFiltersProps {
  filters: SmartFilterState;
  onChange: (filters: SmartFilterState) => void;
  companies: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filterStats?: {
    totalJobs: number;
    filteredJobs: number;
    hiddenJobs: number;
    filterEfficiency: number;
  };
}

const REMOTE_POLICIES = [
  { value: "remote", label: "Fully Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" }
];

const STAGES = [
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
  interested: "Interested",
  applied: "Applied",
  recruiter_screen: "Recruiter Screen",
  hiring_manager: "Hiring Manager", 
  peer: "Peer",
  panel_mock_demo: "Panel/Mock/Demo",
  offer: "Offer",
  rejected: "Rejected",
};

export function SmartFilters({
  filters,
  onChange,
  companies,
  isOpen,
  onOpenChange,
  filterStats
}: SmartFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Focus search input when opening filters
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  const updateFilter = (key: keyof SmartFilterState, value: unknown) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onChange({
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
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.hideRuleouts) count++;
    if (filters.minSalary) count++;
    if (filters.maxSalary) count++;
    if (filters.remotePolicies.length > 0) count++;
    if (filters.minConfidence > 0) count++;
    if (filters.company) count++;
    if (filters.status) count++;
    if (filters.postedAfter) count++;
    if (filters.title) count++;
    if (filters.minFitScore) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            variant="outline" 
            className="relative group transition-all duration-200 hover:shadow-md"
          >
            <Filter className="h-4 w-4 mr-2 transition-transform group-hover:rotate-12" />
            Smart Filters
            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded-sm border opacity-60">
              ⌘K
            </kbd>
            <AnimatePresence>
              {activeCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {activeCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-96 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart Filters
            </SheetTitle>
            <div className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close
            </div>
          </div>
          
          {/* Filter Statistics */}
          {filterStats && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/50 rounded-lg p-3 mt-4"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Results:</span>
                <span className="font-medium">
                  {filterStats.filteredJobs} of {filterStats.totalJobs} jobs
                </span>
              </div>
              {filterStats.hiddenJobs > 0 && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Filtered out:</span>
                  <span className="text-orange-600 font-medium">
                    {filterStats.hiddenJobs} jobs ({filterStats.filterEfficiency.toFixed(0)}%)
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* AI-Powered Filters Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary">AI-Powered Filters</h3>
            </div>
            
            {/* Hide Dealbreakers Toggle */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
            >
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  Hide Dealbreakers
                </Label>
                <p className="text-xs text-muted-foreground">
                  Hide jobs that conflict with your preferences
                </p>
              </div>
              <Switch
                checked={filters.hideRuleouts}
                onCheckedChange={(checked) => updateFilter('hideRuleouts', checked)}
              />
            </motion.div>


            {/* AI Confidence Slider */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="space-y-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
            >
              <Label className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  AI Confidence
                </span>
                <Badge variant="secondary" className="text-xs">
                  {filters.minConfidence}%
                </Badge>
              </Label>
              <Slider
                value={[filters.minConfidence]}
                onValueChange={([value]) => updateFilter('minConfidence', value)}
                max={100}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Filter out jobs with low-confidence AI analysis
              </p>
            </motion.div>
          </motion.div>

          {/* Salary Range */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">💰 Salary Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Min Salary</Label>
                <Input
                  type="number"
                  value={filters.minSalary || ""}
                  onChange={(e) => updateFilter('minSalary', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label className="text-xs">Max Salary</Label>
                <Input
                  type="number"
                  value={filters.maxSalary || ""}
                  onChange={(e) => updateFilter('maxSalary', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Remote Work Policy */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">🏠 Work Arrangement</Label>
            <div className="space-y-2">
              {REMOTE_POLICIES.map((policy) => (
                <div key={policy.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={policy.value}
                    checked={filters.remotePolicies.includes(policy.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter('remotePolicies', [...filters.remotePolicies, policy.value]);
                      } else {
                        updateFilter('remotePolicies', filters.remotePolicies.filter(p => p !== policy.value));
                      }
                    }}
                  />
                  <Label htmlFor={policy.value} className="text-sm">{policy.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">📋 Standard Filters</h3>
            
            {/* Company Filter */}
            <div>
              <Label className="text-sm">Company</Label>
              <select
                value={filters.company || ""}
                onChange={(e) => updateFilter('company', e.target.value || undefined)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <Label className="text-sm">Status</Label>
              <select
                value={filters.status || ""}
                onChange={(e) => updateFilter('status', e.target.value || undefined)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>{STAGE_LABEL[stage]}</option>
                ))}
              </select>
            </div>

            {/* Posted After */}
            <div>
              <Label className="text-sm">Posted After</Label>
              <Input
                type="date"
                value={filters.postedAfter || ""}
                onChange={(e) => updateFilter('postedAfter', e.target.value || undefined)}
              />
            </div>

            {/* Title Search */}
            <div>
              <Label className="text-sm">Job Title</Label>
              <Input
                placeholder="e.g. Frontend Engineer"
                value={filters.title || ""}
                onChange={(e) => updateFilter('title', e.target.value || undefined)}
              />
            </div>

            {/* AI Fit Score */}
            <div>
              <Label className="text-sm">Minimum AI Fit Score</Label>
              <Input
                type="number"
                placeholder="e.g. 75"
                min="0"
                max="100"
                value={filters.minFitScore || ""}
                onChange={(e) => updateFilter('minFitScore', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Clear All Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="w-full group transition-all duration-200 hover:shadow-md"
              disabled={activeCount === 0}
            >
              <X className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
              Clear All Filters
              {activeCount > 0 && (
                <Badge className="ml-2 bg-destructive/20 text-destructive border-destructive/30">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}