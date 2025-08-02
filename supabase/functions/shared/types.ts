// Common types for edge functions
export interface JobData {
  id: string
  title: string
  company: string
  description: string
  requirements?: string[]
  location?: string
  salary_range?: string
  posted_date?: string
  application_url?: string
  source?: string
}

export interface JobFacts {
  job_id: string
  title: string
  company: string
  key_requirements: string[]
  nice_to_have: string[]
  technologies: string[]
  experience_level: string
  location_type: 'remote' | 'hybrid' | 'onsite' | 'unknown'
  salary_info?: {
    min?: number
    max?: number
    currency?: string
    period?: 'hourly' | 'monthly' | 'yearly'
  }
  benefits: string[]
  company_info: {
    size?: string
    industry?: string
    description?: string
  }
}

export interface PersonalAnalysis {
  job_id: string
  user_id: string
  overall_match_score: number
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  key_selling_points: string[]
  application_strategy: string
  interview_prep_topics: string[]
  estimated_effort_to_qualify: 'low' | 'medium' | 'high'
}

export interface UserProfile {
  uid: string
  name?: string
  current_title?: string
  location?: string
  seniority?: string
  min_base_comp?: number
  remote_pref?: string
  strengths?: string[]
  red_flags?: string[]
  dealbreakers?: string[]
  interview_style?: string
  preferences?: Record<string, unknown>
  embedding?: string
  created_at?: string
  updated_at?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  correlation_id?: string
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
}

// Validation utilities
export function validateJobData(data: unknown): { isValid: boolean; errors: ValidationError[]; data?: JobData } {
  const errors: ValidationError[] = []
  
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: [{ field: 'root', message: 'Invalid data format' }] }
  }
  
  const job = data as Record<string, unknown>
  
  if (!job.id || typeof job.id !== 'string') {
    errors.push({ field: 'id', message: 'Job ID is required and must be a string' })
  }
  
  if (!job.title || typeof job.title !== 'string') {
    errors.push({ field: 'title', message: 'Job title is required and must be a string' })
  }
  
  if (!job.company || typeof job.company !== 'string') {
    errors.push({ field: 'company', message: 'Company name is required and must be a string' })
  }
  
  if (!job.description || typeof job.description !== 'string' || job.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Job description is required and must be a non-empty string' })
  }
  
  if (job.requirements && !Array.isArray(job.requirements)) {
    errors.push({ field: 'requirements', message: 'Requirements must be an array' })
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors }
  }
  
  return {
    isValid: true,
    errors: [],
    data: job as unknown as JobData
  }
}

export function validateUserProfile(data: unknown): { isValid: boolean; errors: ValidationError[]; data?: UserProfile } {
  const errors: ValidationError[] = []
  
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: [{ field: 'root', message: 'Invalid data format' }] }
  }
  
  const profile = data as Record<string, unknown>
  
  if (!profile.uid || typeof profile.uid !== 'string') {
    errors.push({ field: 'uid', message: 'User UID is required and must be a string' })
  }
  
  // All other fields are optional, just validate types if present (handle both null and undefined)
  if (profile.name !== undefined && profile.name !== null && typeof profile.name !== 'string') {
    errors.push({ field: 'name', message: 'Name must be a string' })
  }
  
  if (profile.current_title !== undefined && profile.current_title !== null && typeof profile.current_title !== 'string') {
    errors.push({ field: 'current_title', message: 'Current title must be a string' })
  }
  
  if (profile.seniority !== undefined && profile.seniority !== null && typeof profile.seniority !== 'string') {
    errors.push({ field: 'seniority', message: 'Seniority must be a string' })
  }
  
  if (profile.min_base_comp !== undefined && profile.min_base_comp !== null && (typeof profile.min_base_comp !== 'number' || profile.min_base_comp < 0)) {
    errors.push({ field: 'min_base_comp', message: 'Min base comp must be a non-negative number' })
  }
  
  if (profile.strengths !== undefined && !Array.isArray(profile.strengths)) {
    errors.push({ field: 'strengths', message: 'Strengths must be an array' })
  }
  
  if (profile.red_flags !== undefined && !Array.isArray(profile.red_flags)) {
    errors.push({ field: 'red_flags', message: 'Red flags must be an array' })
  }
  
  if (profile.dealbreakers !== undefined && !Array.isArray(profile.dealbreakers)) {
    errors.push({ field: 'dealbreakers', message: 'Dealbreakers must be an array' })
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors }
  }
  
  return {
    isValid: true,
    errors: [],
    data: profile as unknown as UserProfile
  }
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  correlationId?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    correlation_id: correlationId,
    timestamp: new Date().toISOString()
  }
}

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
} 