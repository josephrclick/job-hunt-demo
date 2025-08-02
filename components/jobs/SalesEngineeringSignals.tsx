import React from 'react';
import { SalesEngineeringSignals as SalesEngineeringSignalsType } from '@/app/types/enrichment';
import { 
  Presentation, 
  Code, 
  Users, 
  Settings, 
  Target,
  Award,
  Briefcase
} from 'lucide-react';

interface Props {
  signals: SalesEngineeringSignalsType | null | undefined;
}

export function SalesEngineeringSignals({ signals }: Props) {
  if (!signals) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Presentation className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No Sales Engineering signals extracted yet</p>
      </div>
    );
  }

  const { role_composition, demo_poc_environment, methodology_deal_context, enablement_tooling, success_metrics_career } = signals;

  return (
    <div className="space-y-6">
      {/* Role Composition */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Role Composition
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Time Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">Time Allocation</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Presentation className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Demos & PoCs</span>
                </div>
                <span className="text-sm font-medium">{role_composition.demo_poc_percentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Architecture</span>
                </div>
                <span className="text-sm font-medium">{role_composition.architecture_percentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Customer Interaction</span>
                </div>
                <span className="text-sm font-medium">{role_composition.customer_interaction_percentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Enablement</span>
                </div>
                <span className="text-sm font-medium">{role_composition.enablement_percentage}%</span>
              </div>
            </div>
          </div>

          {/* Team Structure */}
          <div>
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">Team Structure</h4>
            <div className="space-y-2 text-sm">
              {role_composition.presales_team_size && (
                <div>
                  <span className="text-muted-foreground">Team Size:</span>
                  <span className="ml-2 font-medium">{role_composition.presales_team_size}</span>
                </div>
              )}
              {role_composition.ae_se_ratio && (
                <div>
                  <span className="text-muted-foreground">AE:SE Ratio:</span>
                  <span className="ml-2 font-medium">{role_composition.ae_se_ratio}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Work Style:</span>
                <span className="ml-2 font-medium">{role_composition.remote_onsite_mix}</span>
              </div>
              {role_composition.travel_percentage && (
                <div>
                  <span className="text-muted-foreground">Travel:</span>
                  <span className="ml-2 font-medium">{role_composition.travel_percentage}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demo & PoC Environment */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Presentation className="h-4 w-4" />
          Demo & PoC Environment
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Technical Setup */}
          <div>
            <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-3">Technical Setup</h4>
            
            {demo_poc_environment.tech_stack.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-muted-foreground">Tech Stack:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {demo_poc_environment.tech_stack.map((tech, index) => (
                    <span key={index} className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {demo_poc_environment.demo_tooling.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-muted-foreground">Demo Tooling:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {demo_poc_environment.demo_tooling.map((tool, index) => (
                    <span key={index} className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm space-y-1">
              {demo_poc_environment.demo_count.built_vs_maintained && (
                <div>
                  <span className="text-muted-foreground">Demo Strategy:</span>
                  <span className="ml-2 font-medium">{demo_poc_environment.demo_count.built_vs_maintained}</span>
                </div>
              )}
              {demo_poc_environment.demo_count.demo_types.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Demo Types:</span>
                  <span className="ml-2 font-medium">{demo_poc_environment.demo_count.demo_types.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* PoC Characteristics */}
          <div>
            <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-3">PoC Characteristics</h4>
            <div className="space-y-2 text-sm">
              {demo_poc_environment.poc_characteristics.typical_duration && (
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{demo_poc_environment.poc_characteristics.typical_duration}</span>
                </div>
              )}
              {demo_poc_environment.poc_characteristics.customer_count_avg && (
                <div>
                  <span className="text-muted-foreground">Avg Customers/Quarter:</span>
                  <span className="ml-2 font-medium">{demo_poc_environment.poc_characteristics.customer_count_avg}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Success Metrics:</span>
                <span className={`ml-2 font-medium ${demo_poc_environment.poc_characteristics.success_criteria_defined ? 'text-green-600' : 'text-yellow-600'}`}>
                  {demo_poc_environment.poc_characteristics.success_criteria_defined ? 'Well-defined' : 'Unclear'}
                </span>
              </div>
              {demo_poc_environment.poc_characteristics.ownership_level && (
                <div>
                  <span className="text-muted-foreground">Ownership:</span>
                  <span className="ml-2 font-medium">{demo_poc_environment.poc_characteristics.ownership_level}</span>
                </div>
              )}
            </div>

            {/* Complexity Indicators */}
            <div className="mt-4">
              <span className="text-xs text-muted-foreground block mb-2">Complexity Indicators:</span>
              <div className="flex flex-wrap gap-2">
                {demo_poc_environment.complexity_indicators.data_integration && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                    Data Integration
                  </span>
                )}
                {demo_poc_environment.complexity_indicators.multi_region && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                    Multi-Region
                  </span>
                )}
                {demo_poc_environment.complexity_indicators.regulatory_requirements && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                    Regulatory
                  </span>
                )}
                {demo_poc_environment.complexity_indicators.custom_development && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                    Custom Dev
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Methodology & Deal Context */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Sales Methodology & Deal Context
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sales Framework & Deal Info */}
          <div>
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">Sales Framework</h4>
            {methodology_deal_context.sales_framework.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {methodology_deal_context.sales_framework.map((framework, index) => (
                  <span key={index} className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                    {framework}
                  </span>
                ))}
              </div>
            )}

            <div className="text-sm space-y-2">
              {methodology_deal_context.deal_characteristics.typical_acv_band && (
                <div>
                  <span className="text-muted-foreground">Deal Size:</span>
                  <span className="ml-2 font-medium">{methodology_deal_context.deal_characteristics.typical_acv_band}</span>
                </div>
              )}
              {methodology_deal_context.deal_characteristics.deal_complexity && (
                <div>
                  <span className="text-muted-foreground">Complexity:</span>
                  <span className="ml-2 font-medium">{methodology_deal_context.deal_characteristics.deal_complexity}</span>
                </div>
              )}
              {methodology_deal_context.deal_characteristics.cycle_length_avg && (
                <div>
                  <span className="text-muted-foreground">Cycle Length:</span>
                  <span className="ml-2 font-medium">{methodology_deal_context.deal_characteristics.cycle_length_avg}</span>
                </div>
              )}
            </div>

            {methodology_deal_context.role_in_cycle.length > 0 && (
              <div className="mt-4">
                <span className="text-xs text-muted-foreground block mb-2">Your Role in Sales Cycle:</span>
                <div className="flex flex-wrap gap-1">
                  {methodology_deal_context.role_in_cycle.map((role, index) => (
                    <span key={index} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Profile & Competition */}
          <div>
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">Customer Profile</h4>
            
            {methodology_deal_context.customer_profile.target_verticals.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-muted-foreground block mb-2">Target Verticals:</span>
                <div className="flex flex-wrap gap-1">
                  {methodology_deal_context.customer_profile.target_verticals.map((vertical, index) => (
                    <span key={index} className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      {vertical}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm space-y-2 mb-4">
              {methodology_deal_context.customer_profile.customer_size_focus && (
                <div>
                  <span className="text-muted-foreground">Customer Size:</span>
                  <span className="ml-2 font-medium">{methodology_deal_context.customer_profile.customer_size_focus}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Strategic Logos:</span>
                <span className={`ml-2 font-medium ${methodology_deal_context.customer_profile.strategic_logos_mentioned ? 'text-green-600' : 'text-gray-600'}`}>
                  {methodology_deal_context.customer_profile.strategic_logos_mentioned ? 'Mentioned' : 'Not mentioned'}
                </span>
              </div>
            </div>

            {methodology_deal_context.competitive_landscape.direct_competitors_mentioned.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground block mb-2">Competitors Mentioned:</span>
                <div className="flex flex-wrap gap-1">
                  {methodology_deal_context.competitive_landscape.direct_competitors_mentioned.map((competitor, index) => (
                    <span key={index} className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                      {competitor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enablement & Tooling and Success Metrics in a 2-column layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Enablement & Tooling */}
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Enablement & Tooling
          </h3>
          
          <div className="space-y-4">
            {/* Training Responsibilities */}
            <div>
              <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Training</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded ${enablement_tooling.training_responsibilities.internal_design ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  Internal Design
                </div>
                <div className={`p-2 rounded ${enablement_tooling.training_responsibilities.internal_delivery ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  Internal Delivery
                </div>
                <div className={`p-2 rounded ${enablement_tooling.training_responsibilities.partner_enablement ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  Partner Enablement
                </div>
                <div className={`p-2 rounded ${enablement_tooling.training_responsibilities.customer_enablement ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  Customer Enablement
                </div>
              </div>
            </div>

            {/* Tool Ownership */}
            <div>
              <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Tool Ownership</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded ${enablement_tooling.tool_ownership.demo_automation ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  Demo Automation
                </div>
                <div className={`p-2 rounded ${enablement_tooling.tool_ownership.internal_portals ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  Internal Portals
                </div>
                <div className={`p-2 rounded ${enablement_tooling.tool_ownership.playbook_creation ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  Playbook Creation
                </div>
                <div className={`p-2 rounded ${enablement_tooling.tool_ownership.integration_tools ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  Integration Tools
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Metrics & Career */}
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Success Metrics & Career
          </h3>
          
          <div className="space-y-4">
            {/* KPIs */}
            {success_metrics_career.kpis_mentioned.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">KPIs Mentioned</h4>
                <div className="flex flex-wrap gap-1">
                  {success_metrics_career.kpis_mentioned.map((kpi, index) => (
                    <span key={index} className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                      {kpi}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Career Progression */}
            <div>
              <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Career Progression</h4>
              <div className="text-sm space-y-1">
                {success_metrics_career.career_progression.promotion_path.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Path:</span>
                    <span className="ml-2 font-medium">{success_metrics_career.career_progression.promotion_path.join(' → ')}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Growth Signals:</span>
                  <span className={`ml-2 font-medium ${success_metrics_career.career_progression.growth_signals ? 'text-green-600' : 'text-gray-600'}`}>
                    {success_metrics_career.career_progression.growth_signals ? 'Present' : 'Not mentioned'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Leadership Opportunities:</span>
                  <span className={`ml-2 font-medium ${success_metrics_career.career_progression.leadership_opportunities ? 'text-green-600' : 'text-gray-600'}`}>
                    {success_metrics_career.career_progression.leadership_opportunities ? 'Available' : 'Not mentioned'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}