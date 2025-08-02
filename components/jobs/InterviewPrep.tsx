import React from 'react';
import { InterviewIntelligence } from '@/app/types/enrichment';
import { 
  Calendar, 
  Clock, 
  Video, 
  Code, 
  Presentation, 
  AlertTriangle, 
  CheckCircle2,
  Star,
  FileText,
  Users,
  Lightbulb
} from 'lucide-react';

interface Props {
  intelligence: InterviewIntelligence | null | undefined;
}

export function InterviewPrep({ intelligence }: Props) {
  if (!intelligence) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No interview intelligence generated yet</p>
      </div>
    );
  }

  const { predicted_stages, technical_assessment, preparation_priorities, red_flags, success_factors } = intelligence;

  // Get stage icon based on format
  const getStageIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Calendar className="h-4 w-4" />;
      case 'onsite': return <Users className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  // Get severity color for red flags
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'moderate': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900';
      case 'minor': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Predicted Interview Stages */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Predicted Interview Stages
        </h3>
        
        <div className="space-y-4">
          {predicted_stages.map((stage, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStageIcon(stage.format)}
                  <h4 className="font-medium text-foreground">{stage.stage_name}</h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    Priority: {stage.preparation_weight}/10
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {stage.typical_duration}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Focus Areas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {stage.focus_areas.map((area, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Interviewer Roles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {stage.interviewer_roles.map((role, idx) => (
                      <span key={idx} className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Assessment */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Code className="h-4 w-4" />
          Technical Assessment Likelihood
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">Live Coding</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                technical_assessment.live_coding_likelihood === 'certain' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                technical_assessment.live_coding_likelihood === 'likely' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                technical_assessment.live_coding_likelihood === 'possible' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {technical_assessment.live_coding_likelihood}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">System Design</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                technical_assessment.system_design_expected ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {technical_assessment.system_design_expected ? 'Expected' : 'Unlikely'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Presentation className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">Mock Demo</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                technical_assessment.mock_demo_required ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {technical_assessment.mock_demo_required ? 'Required' : 'Unlikely'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">Presentation</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                technical_assessment.presentation_required ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {technical_assessment.presentation_required ? 'Required' : 'Unlikely'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">Take Home</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                technical_assessment.take_home_assignment ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {technical_assessment.take_home_assignment ? 'Possible' : 'Unlikely'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">Whiteboarding</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                technical_assessment.whiteboarding_expected ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {technical_assessment.whiteboarding_expected ? 'Expected' : 'Unlikely'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preparation Priorities */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="h-4 w-4" />
          Preparation Priorities
        </h3>
        
        <div className="space-y-4">
          {preparation_priorities.map((priority, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  {priority.confidence_booster && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {priority.priority_area}
                  {priority.confidence_booster && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      Confidence Booster
                    </span>
                  )}
                </h4>
                <span className="text-sm text-muted-foreground">{priority.time_allocation}</span>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Specific Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {priority.specific_topics.map((topic, idx) => (
                    <span key={idx} className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Red Flags & Success Factors side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Red Flags */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Interview Red Flags
          </h3>
          
          {red_flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No red flags identified</p>
          ) : (
            <div className="space-y-3">
              {red_flags.map((flag, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{flag.concern_type}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(flag.severity)}`}>
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{flag.description}</p>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Mitigation:</span> {flag.mitigation_strategy}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Factors */}
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Success Factors
          </h3>
          
          <div className="space-y-4">
            {/* Key Differentiators */}
            {success_factors.key_differentiators.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Key Differentiators</h4>
                <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                  {success_factors.key_differentiators.map((diff, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 mt-1 flex-shrink-0" />
                      {diff}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Failure Points */}
            {success_factors.common_failure_points.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Avoid These Mistakes</h4>
                <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                  {success_factors.common_failure_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 mt-1 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cultural Fit Signals */}
            {success_factors.cultural_fit_signals.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Cultural Fit Signals</h4>
                <div className="flex flex-wrap gap-1">
                  {success_factors.cultural_fit_signals.map((signal, index) => (
                    <span key={index} className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}