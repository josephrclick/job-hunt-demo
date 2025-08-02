import React from 'react';
import { QuickWins } from '@/app/types/enrichment';
import { 
  Target, 
  Presentation, 
  TrendingUp, 
  Users, 
  Calendar,
  Lightbulb,
  CheckCircle2,
  Star,
  ArrowRight,
  Award
} from 'lucide-react';

interface Props {
  quickWins: QuickWins | null | undefined;
}

export function QuickWinsCard({ quickWins }: Props) {
  if (!quickWins) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No quick wins mapped yet</p>
      </div>
    );
  }

  const { direct_matches, demo_suggestions, process_improvements, positioning_strategies, first_90_days } = quickWins;

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'immediate': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'short-term': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'strategic': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  // Get effort color
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'quick win': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'medium term': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'strategic project': return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  // Get complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'moderate': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'complex': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Direct Matches */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Direct Strength Matches
        </h3>
        
        {direct_matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No direct matches identified</p>
        ) : (
          <div className="space-y-4">
            {direct_matches.map((match, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-foreground">{match.joseph_strength}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-muted-foreground">{match.role_requirement}</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-2">{match.talking_point}</p>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Proof point:</span> {match.proof_point}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getImpactColor(match.impact_potential)}`}>
                    {match.impact_potential}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo Suggestions */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Presentation className="h-4 w-4" />
          Demo Suggestions
        </h3>
        
        {demo_suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No demo suggestions available</p>
        ) : (
          <div className="space-y-4">
            {demo_suggestions.map((demo, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-foreground">{demo.demo_concept}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${getComplexityColor(demo.preparation_complexity)}`}>
                    {demo.preparation_complexity}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Tech Stack Alignment:</span>
                    <div className="flex flex-wrap gap-1">
                      {demo.tech_stack_alignment.map((tech, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground">Business Value:</span>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{demo.business_value_story}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground">Differentiation Factor:</span>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{demo.differentiation_factor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process Improvements */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Process Improvement Opportunities
        </h3>
        
        {process_improvements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No process improvements identified</p>
        ) : (
          <div className="space-y-4">
            {process_improvements.map((improvement, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-foreground">{improvement.improvement_area}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${getEffortColor(improvement.implementation_effort)}`}>
                    {improvement.implementation_effort}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Current State (Assumed):</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{improvement.current_state_assumption}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground">Joseph&apos;s Solution:</span>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">{improvement.joseph_solution}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Stakeholder Impact:</span>
                    <div className="flex flex-wrap gap-1">
                      {improvement.stakeholder_impact.map((stakeholder, idx) => (
                        <span key={idx} className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                          {stakeholder}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Positioning Strategies & First 90 Days side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Positioning Strategies */}
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Positioning Strategies
          </h3>
          
          <div className="space-y-4">
            {/* Unique Value Proposition */}
            <div>
              <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Unique Value Proposition</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">{positioning_strategies.unique_value_proposition}</p>
            </div>

            {/* Competitive Advantages */}
            {positioning_strategies.competitive_advantages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Competitive Advantages</h4>
                <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                  {positioning_strategies.competitive_advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 mt-1 flex-shrink-0" />
                      {advantage}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Mitigation */}
            {positioning_strategies.risk_mitigation.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Risk Mitigation</h4>
                <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                  {positioning_strategies.risk_mitigation.map((mitigation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 mt-1 flex-shrink-0" />
                      {mitigation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Growth Narrative */}
            <div>
              <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Growth Narrative</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">{positioning_strategies.growth_narrative}</p>
            </div>
          </div>
        </div>

        {/* First 90 Days */}
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            First 90 Days Plan
          </h3>
          
          {first_90_days.length === 0 ? (
            <p className="text-sm text-muted-foreground">No 90-day plan available</p>
          ) : (
            <div className="space-y-4">
              {first_90_days.map((milestone, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Award className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <h4 className="font-medium text-foreground">{milestone.milestone}</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Success Criteria:</span>
                      <p className="text-indigo-600 dark:text-indigo-400 mt-1">{milestone.success_criteria}</p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Stakeholder Impact:</span>
                      <p className="text-indigo-600 dark:text-indigo-400 mt-1">{milestone.stakeholder_impact}</p>
                    </div>
                    
                    {milestone.required_support.length > 0 && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Required Support:</span>
                        <div className="flex flex-wrap gap-1">
                          {milestone.required_support.map((support, idx) => (
                            <span key={idx} className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                              {support}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cultural Alignment */}
      {positioning_strategies.cultural_alignment.length > 0 && (
        <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Cultural Alignment Points
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {positioning_strategies.cultural_alignment.map((point, index) => (
              <span key={index} className="text-sm bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-3 py-2 rounded-lg">
                {point}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}