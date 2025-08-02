import React, { useState } from 'react';
import { JobDisplay } from '@/app/types/job';
import { SalesEngineeringSignals as SalesEngineeringSignalsType, InterviewIntelligence, QuickWins } from '@/app/types/enrichment';
import { Button } from '@/components/ui/button';
import { DealbreakerBadge } from './DealbreakerBadge';
import { EditableJobTitle } from './EditableJobTitle';
import { DimensionalScores } from './DimensionalScores';
import { SalesEngineeringSignals } from './SalesEngineeringSignals';
import { InterviewPrep } from './InterviewPrep';
import { QuickWinsCard } from './QuickWinsCard';
import { InterviewTracker } from './InterviewTracker';
import { InterviewStage } from '@/types/interview';
import JobNotesAndDocs from './JobNotesAndDocs';
import { 
  ExternalLink, 
  DollarSign, 
  Building, 
  Target,
  TrendingUp,
  FileText,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Loader2,
  Shield,
  Presentation,
  Calendar,
  Star,
  Users
} from 'lucide-react';

interface Props {
  job: JobDisplay;
  onJobUpdate?: (updatedJob: Partial<JobDisplay>) => void;
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

// Risk interface matching the Zod RiskSchema
interface Risk {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  evidence: string[];
  confidence?: number;
  mitigation_strategy?: string;
}

// Extended enrichment type that includes new V3 fields
interface EnrichmentData {
  // Existing fields
  ai_fit_score?: number;
  dealbreaker_hit?: boolean;
  comp_range?: string;
  tech_stack_alignment?: Record<string, number>;
  skills_sought?: string[] | Record<string, unknown>;
  skills_matched?: string[];
  skills_gap?: string[];
  concerns?: string[];
  insights?: string[];
  fit_reasoning?: string;
  key_strengths?: string[];
  ai_tailored_summary?: string;
  experience_match?: boolean;
  remote_policy?: string;
  risks?: Record<string, boolean | Risk> | (string | Risk)[];
  raw_json?: Record<string, unknown>;
  extracted_fields?: Record<string, unknown>;
  
  // Dimensional scores
  culture_fit_score?: number;
  growth_potential_score?: number;
  work_life_balance_score?: number;
  compensation_competitiveness_score?: number;
  overall_recommendation_score?: number;
  
  // New V3 enrichment fields
  sales_engineering_signals?: SalesEngineeringSignalsType | Record<string, unknown>;
  interview_intelligence?: InterviewIntelligence | Record<string, unknown>;
  quick_wins?: QuickWins | Record<string, unknown>;
}

export default function JobDetailTabs({ job, onJobUpdate }: Props) {
  const [generateResumeLoading, setGenerateResumeLoading] = useState(false);
  const [generateLetterLoading, setGenerateLetterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Handle job title update
  const handleTitleUpdate = (newTitle: string) => {
    if (onJobUpdate) {
      onJobUpdate({ title: newTitle });
    }
  };

  // Helper function to safely render skill objects
  const renderSkill = (skill: string | Record<string, unknown>): string => {
    if (typeof skill === 'string') {
      return skill;
    }
    if (skill && typeof skill === 'object' && 'skill' in skill && typeof skill.skill === 'string') {
      return skill.skill;
    }
    return JSON.stringify(skill) || 'Unknown skill';
  };

  // Helper function to safely render risk objects
  const renderRisk = (risk: string | Risk): string => {
    if (typeof risk === 'string') {
      return risk;
    }
    if (risk && typeof risk === 'object') {
      // Handle structured risk object
      if ('reason' in risk && typeof risk.reason === 'string') {
        return risk.reason;
      }
      if ('category' in risk && typeof risk.category === 'string') {
        return risk.category;
      }
      // Fallback to JSON stringify
      return JSON.stringify(risk);
    }
    return 'Unknown risk';
  };

  if (!job) return <div className="p-4 text-muted-foreground">Select a job to view details</div>;

  const enrichment = (job.enrichment ?? {}) as EnrichmentData;
  const extracted = (enrichment.extracted_fields || {}) as ExtractedFields;

  // Check if new enrichment data is available
  const hasSeSignals = enrichment.sales_engineering_signals;
  const hasInterviewIntel = enrichment.interview_intelligence;
  const hasQuickWins = enrichment.quick_wins;
  
  // Debug logging to see what's in enrichment
  console.log('V3 Enrichment Fields:', {
    sales_engineering_signals: enrichment.sales_engineering_signals,
    interview_intelligence: enrichment.interview_intelligence,
    quick_wins: enrichment.quick_wins,
    hasSeSignals: !!hasSeSignals,
    hasInterviewIntel: !!hasInterviewIntel,
    hasQuickWins: !!hasQuickWins
  });

  // Define tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    ...(hasSeSignals ? [{ id: 'se-signals', label: 'SE Signals', icon: Presentation }] : []),
    ...(hasInterviewIntel ? [{ id: 'interview-prep', label: 'Interview Prep', icon: Calendar }] : []),
    ...(hasQuickWins ? [{ id: 'quick-wins', label: 'Quick Wins', icon: Star }] : []),
    { id: 'notes-docs', label: 'Notes & Docs', icon: FileText },
    { id: 'interviews', label: 'Interviews', icon: Users }
  ];

  // Generate resume handler
  const handleGenerateResume = async () => {
    setGenerateResumeLoading(true);
    try {
      const response = await fetch(`/api/jobs/generate-resume?jobId=${job.id}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Resume of Joseph Click - ${job.company?.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim() || 'Company'}.PDF`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
    } finally {
      setGenerateResumeLoading(false);
    }
  };

  // Generate cover letter handler  
  const handleGenerateLetter = async () => {
    setGenerateLetterLoading(true);
    try {
      const response = await fetch(`/api/jobs/generate-cover-letter?jobId=${job.id}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Cover Letter of Joseph Click - ${job.company?.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim() || 'Company'}.PDF`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
    } finally {
      setGenerateLetterLoading(false);
    }
  };
  
  // Format salary display
  const formatSalary = () => {
    if (job.salary) return job.salary;
    if (enrichment.comp_range) return enrichment.comp_range;
    if (extracted.comp_min && extracted.comp_max) {
      return `$${extracted.comp_min?.toLocaleString()} - $${extracted.comp_max?.toLocaleString()}`;
    }
    return 'Not specified';
  };

  // Format experience display
  const formatExperience = () => {
    if (extracted.experience_years_min && extracted.experience_years_max) {
      return `${extracted.experience_years_min}-${extracted.experience_years_max} years`;
    } else if (extracted.experience_years_min) {
      return `${extracted.experience_years_min}+ years`;
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Enhanced Header with Key Info */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <EditableJobTitle
              jobId={job.id}
              initialTitle={job.title}
              onTitleUpdate={handleTitleUpdate}
              className="mb-1"
            />
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {job.company}
              </div>
              {formatSalary() && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary()}
                </div>
              )}
            </div>
            
            {/* Key Details Row */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              {formatExperience() && (
                <span>Experience: {formatExperience()}</span>
              )}
              {extracted.remote_policy && (
                <span>Remote: {extracted.remote_policy}</span>
              )}
              {extracted.travel_required && (
                <span>Travel: {extracted.travel_required}</span>
              )}
            </div>
          </div>
          
          {/* Action Buttons - Stacked Vertically */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleGenerateResume}
              disabled={generateResumeLoading}
              size="sm"
              className="w-full"
            >
              {generateResumeLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-1" />
              )}
              Generate Resume
            </Button>
            <Button 
              onClick={handleGenerateLetter}
              disabled={generateLetterLoading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {generateLetterLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-1" />
              )}
              Generate Letter
            </Button>
            {job.url && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Job
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Separator with AI Analysis */}
        <div className="flex items-start gap-4 pt-3 border-t border-border/50">
          <DealbreakerBadge 
            dealbreakerHit={enrichment?.dealbreaker_hit} 
            extractedFields={enrichment?.extracted_fields as Record<string, unknown>}
          />
          
          {/* AI Tailored Summary - moved from main content */}
          {enrichment?.ai_tailored_summary && (
            <div className="flex-1">
              <p className="text-base text-muted-foreground leading-relaxed">
                {enrichment.ai_tailored_summary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-1 px-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
        {/* AI Insights Section – Moved to top */}
        {(enrichment?.insights || enrichment?.concerns || enrichment?.fit_reasoning || enrichment?.key_strengths) && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-6">
            {/* Insights */}
            {enrichment.insights && Array.isArray(enrichment.insights) && enrichment.insights.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Insights</h3>
                <div className="space-y-1">
                  {enrichment.insights.map((insight: string, index: number) => (
                    <div key={index} className="text-sm text-muted-foreground">• {insight}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns */}
            {enrichment.concerns && Array.isArray(enrichment.concerns) && enrichment.concerns.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Concerns</h3>
                <div className="space-y-1">
                  {enrichment.concerns.map((concern: string, index: number) => (
                    <div key={index} className="text-sm text-muted-foreground">• {concern}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Fit Reasoning */}
            {enrichment.fit_reasoning && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Fit Reasoning</h3>
                <div className="text-sm text-muted-foreground">{enrichment.fit_reasoning}</div>
              </div>
            )}

            {/* Key Strengths */}
            {enrichment.key_strengths && Array.isArray(enrichment.key_strengths) && enrichment.key_strengths.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Key Strengths</h3>
                <div className="space-y-1">
                  {enrichment.key_strengths.map((strength: string, index: number) => (
                    <div key={index} className="text-sm text-muted-foreground">• {strength}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* V2 Implicit Risks - Show if available */}
        {enrichment?.risks && typeof enrichment.risks === 'object' && Object.keys(enrichment.risks).length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Analysis
            </h3>
            <div className="space-y-3">
              {Object.entries(enrichment.risks).map(([category, risk]) => {
                // Handle different risk formats
                if (typeof risk === 'boolean' && risk) {
                  return (
                    <div key={category} className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{category.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  );
                } else if (typeof risk === 'object' && risk !== null) {
                  const riskObj = risk as any;
                  return (
                    <div key={category} className="flex items-start gap-3">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                        riskObj.severity === 'HIGH' ? 'text-red-600 dark:text-red-400' :
                        riskObj.severity === 'MEDIUM' ? 'text-orange-600 dark:text-orange-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {riskObj.category || category.replace(/_/g, ' ')}
                        </p>
                        {riskObj.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{riskObj.reason}</p>
                        )}
                        {riskObj.evidence && Array.isArray(riskObj.evidence) && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Evidence: {riskObj.evidence.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
        {/* Technology Stack - First Section */}
        {(enrichment?.tech_stack_alignment && Object.keys(enrichment.tech_stack_alignment).length > 0) || 
         (extracted?.tech_stack && extracted.tech_stack.length > 0) && (
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Requirements
            </h3>
            
            {/* Tech Stack Alignment Scores */}
            {enrichment?.tech_stack_alignment && Object.keys(enrichment.tech_stack_alignment).length > 0 && (
              <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Your Alignment Scores</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(enrichment.tech_stack_alignment).map(([tech, score]) => (
                    <div key={tech} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{tech}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        score >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements Box – Skills Sought & Required Technologies side-by-side */}
            {((extracted?.tech_stack && extracted.tech_stack.length > 0) || enrichment?.skills_sought) && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Skills Sought column */}
                  {enrichment?.skills_sought && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">Skills Sought</h4>
                      <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                        {Array.isArray(enrichment.skills_sought)
                          ? enrichment.skills_sought.map((skill: string | Record<string, unknown>, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                {renderSkill(skill)}
                              </li>
                            ))
                          : Object.entries(enrichment.skills_sought as Record<string, unknown>).map(([, value], index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                {typeof value === 'string' ? value : renderSkill(value as string | Record<string, unknown>)}
                              </li>
                            ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Technologies column */}
                  {extracted?.tech_stack && extracted.tech_stack.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">Required Technologies</h4>
                      <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                        {extracted.tech_stack.map((tech: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}


        {/* Skills & Analysis - Third Section */}
        {(enrichment?.skills_matched?.length || enrichment?.skills_gap?.length) && (
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Skills Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Skills Matched */}
              {enrichment?.skills_matched && enrichment.skills_matched.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Skills You Have
                  </h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    {enrichment.skills_matched.map((skill: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Gap */}
              {enrichment?.skills_gap && enrichment.skills_gap.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Skills to Develop
                  </h4>
                  <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                    {enrichment.skills_gap.map((skill: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risks Analysis - Fourth Section */}
        {enrichment?.risks && (
          Array.isArray(enrichment.risks) ? enrichment.risks.length > 0 : Object.keys(enrichment.risks).length > 0
        ) && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Risks Analysis
            </h3>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {Array.isArray(enrichment.risks)
                ? enrichment.risks.map((risk, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {renderRisk(risk)}
                    </li>
                  ))
                : Object.entries(enrichment.risks as Record<string, boolean | Risk>).map(([, value], index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{typeof value === 'boolean' ? (value ? 'Risk identified' : 'No risk') : renderRisk(value)}</span>
                    </li>
                  ))}
            </ul>
          </div>
        )}

        {/* V2 Dimensional Scores - Moved to bottom */}
        {enrichment && (
          enrichment.culture_fit_score !== undefined ||
          enrichment.growth_potential_score !== undefined ||
          enrichment.work_life_balance_score !== undefined ||
          enrichment.compensation_competitiveness_score !== undefined ||
          enrichment.overall_recommendation_score !== undefined
        ) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI Analysis Scores
            </h3>
            <DimensionalScores
              scores={{
                culture_fit_score: enrichment.culture_fit_score,
                growth_potential_score: enrichment.growth_potential_score,
                work_life_balance_score: enrichment.work_life_balance_score,
                compensation_competitiveness_score: enrichment.compensation_competitiveness_score,
                overall_recommendation_score: enrichment.overall_recommendation_score
              }}
              variant="detailed"
            />
          </div>
        )}

        {/* Complete Raw JSON Data */}
        {enrichment?.raw_json && Object.keys(enrichment.raw_json).length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-gray-600" />
              Complete Enrichment Raw Data
            </h3>
            <div className="max-h-48 overflow-y-auto">
              <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">
                {JSON.stringify(enrichment.raw_json, null, 2)}
              </pre>
            </div>
          </div>
        )}
          </div>
        )}

        {/* Notes & Docs Tab */}
        {activeTab === 'notes-docs' && (
          <JobNotesAndDocs
            jobId={job.id}
            jobTitle={job.title}
            company={job.company}
          />
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <InterviewTracker
            jobId={job.id}
            jobTitle={job.title}
            company={job.company}
            currentStage={job.current_interview_stage as InterviewStage}
            interviewStatus={job.interview_status}
          />
        )}

        {/* Sales Engineering Signals Tab */}
        {activeTab === 'se-signals' && (
          <SalesEngineeringSignals signals={enrichment.sales_engineering_signals as SalesEngineeringSignalsType | null} />
        )}

        {/* Interview Prep Tab */}
        {activeTab === 'interview-prep' && (
          <InterviewPrep intelligence={enrichment.interview_intelligence as InterviewIntelligence | null} />
        )}

        {/* Quick Wins Tab */}
        {activeTab === 'quick-wins' && (
          <QuickWinsCard quickWins={enrichment.quick_wins as QuickWins | null} />
        )}
      </div>
    </div>
  );
} 