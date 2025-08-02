import { Database } from '@/supabase/supabase.generated';

export type InterviewStage = Database['public']['Enums']['interview_stage'];

export type InterviewStatus = 
  | 'not_applied'
  | 'applied'
  | 'interviewing'
  | 'on_hold'
  | 'rejected'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined'
  | 'withdrawn';

export type InterviewRoundStatus = 
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no_show';

export type InterviewFormat = 
  | 'video'
  | 'phone'
  | 'onsite'
  | 'take_home'
  | 'panel'
  | 'casual';

export type InterviewOutcome = 
  | 'passed'
  | 'failed'
  | 'pending'
  | 'strong_yes'
  | 'yes'
  | 'no'
  | 'strong_no'
  | 'mixed';

export type InterviewRound = Database['public']['Tables']['interview_rounds']['Row'];
export type InterviewRoundInsert = Database['public']['Tables']['interview_rounds']['Insert'];
export type InterviewRoundUpdate = Database['public']['Tables']['interview_rounds']['Update'];

export interface InterviewTemplate {
  name: 'FAANG' | 'Startup' | 'Enterprise' | 'Custom';
  description: string;
  rounds: InterviewRoundTemplate[];
}

export interface InterviewRoundTemplate {
  round_number: number;
  stage: InterviewStage;
  interview_format: InterviewFormat;
  typical_duration_minutes?: number;
  typical_days_after_previous?: number;
}

export const INTERVIEW_TEMPLATES: InterviewTemplate[] = [
  {
    name: 'FAANG',
    description: 'Typical FAANG interview process (7 rounds)',
    rounds: [
      { round_number: 1, stage: 'phone_screen', interview_format: 'phone', typical_duration_minutes: 30 },
      { round_number: 2, stage: 'technical_1', interview_format: 'video', typical_duration_minutes: 60, typical_days_after_previous: 7 },
      { round_number: 3, stage: 'technical_2', interview_format: 'video', typical_duration_minutes: 60, typical_days_after_previous: 3 },
      { round_number: 4, stage: 'behavioral', interview_format: 'video', typical_duration_minutes: 45, typical_days_after_previous: 3 },
      { round_number: 5, stage: 'system_design', interview_format: 'video', typical_duration_minutes: 60, typical_days_after_previous: 3 },
      { round_number: 6, stage: 'onsite', interview_format: 'onsite', typical_duration_minutes: 240, typical_days_after_previous: 7 },
      { round_number: 7, stage: 'final', interview_format: 'video', typical_duration_minutes: 30, typical_days_after_previous: 5 }
    ]
  },
  {
    name: 'Startup',
    description: 'Typical startup interview process (3 rounds)',
    rounds: [
      { round_number: 1, stage: 'phone_screen', interview_format: 'phone', typical_duration_minutes: 30 },
      { round_number: 2, stage: 'technical_1', interview_format: 'video', typical_duration_minutes: 90, typical_days_after_previous: 5 },
      { round_number: 3, stage: 'final', interview_format: 'video', typical_duration_minutes: 60, typical_days_after_previous: 3 }
    ]
  },
  {
    name: 'Enterprise',
    description: 'Typical enterprise interview process (5 rounds)',
    rounds: [
      { round_number: 1, stage: 'phone_screen', interview_format: 'phone', typical_duration_minutes: 30 },
      { round_number: 2, stage: 'technical_1', interview_format: 'video', typical_duration_minutes: 60, typical_days_after_previous: 7 },
      { round_number: 3, stage: 'behavioral', interview_format: 'video', typical_duration_minutes: 45, typical_days_after_previous: 5 },
      { round_number: 4, stage: 'onsite', interview_format: 'onsite', typical_duration_minutes: 180, typical_days_after_previous: 10 },
      { round_number: 5, stage: 'final', interview_format: 'video', typical_duration_minutes: 30, typical_days_after_previous: 5 }
    ]
  }
];

export interface InterviewTimeline {
  jobId: string;
  jobTitle: string;
  company: string;
  currentStage: InterviewStage;
  interviewStatus: InterviewStatus;
  rounds: InterviewRound[];
}

export interface InterviewStats {
  totalInterviews: number;
  completedInterviews: number;
  upcomingInterviews: number;
  passRate: number;
  averageDuration: number;
}

export function getNextInterviewStage(currentStage: InterviewStage): InterviewStage {
  const stageOrder: InterviewStage[] = [
    'not_started',
    'phone_screen',
    'technical_1',
    'technical_2',
    'behavioral',
    'onsite',
    'system_design',
    'final',
    'offer',
    'completed'
  ];
  
  const currentIndex = stageOrder.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
    return currentStage;
  }
  
  return stageOrder[currentIndex + 1];
}

export function getStageLabel(stage: InterviewStage): string {
  const labels: Record<InterviewStage, string> = {
    'not_started': 'Not Started',
    'phone_screen': 'Phone Screen',
    'technical_1': 'Technical Round 1',
    'technical_2': 'Technical Round 2',
    'behavioral': 'Behavioral',
    'onsite': 'Onsite',
    'system_design': 'System Design',
    'final': 'Final Round',
    'offer': 'Offer Stage',
    'completed': 'Completed'
  };
  
  return labels[stage] || stage;
}

export function getStatusColor(status: InterviewRoundStatus): string {
  const colors: Record<InterviewRoundStatus, string> = {
    'scheduled': 'blue',
    'completed': 'green',
    'cancelled': 'red',
    'rescheduled': 'yellow',
    'no_show': 'red'
  };
  
  return colors[status] || 'gray';
}

export function getOutcomeColor(outcome: InterviewOutcome | null): string {
  if (!outcome) return 'gray';
  
  const colors: Record<InterviewOutcome, string> = {
    'strong_yes': 'green',
    'yes': 'green',
    'passed': 'green',
    'pending': 'yellow',
    'mixed': 'yellow',
    'no': 'red',
    'strong_no': 'red',
    'failed': 'red'
  };
  
  return colors[outcome] || 'gray';
}