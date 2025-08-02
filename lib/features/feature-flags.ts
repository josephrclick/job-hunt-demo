import crypto from 'crypto';

/**
 * Feature flag system for gradual v2 enrichment rollout
 * Uses deterministic hashing for consistent user experience
 */

// Get user ID from various sources
export function getCurrentUserId(): string | undefined {
  // In a real app, this would come from auth context
  // For now, use a stable identifier from localStorage or generate one
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('userId', userId);
    }
    return userId;
  }
  return undefined;
}

/**
 * Check if v2 enrichment is enabled for the current user
 * @param userId - Optional user ID for deterministic rollout
 * @returns true if v2 should be used, false for v1
 */
export function isV2EnrichmentEnabled(userId?: string): boolean {
  // Check hard disable flag
  if (process.env.USE_V2_ENRICHMENT === 'false') {
    return false;
  }

  // Check if explicitly enabled
  if (process.env.USE_V2_ENRICHMENT === 'true' && !process.env.V2_ROLLOUT_PERCENTAGE) {
    return true;
  }

  // Percentage-based rollout
  const percentage = parseInt(process.env.V2_ROLLOUT_PERCENTAGE || '0', 10);
  
  // Full rollout
  if (percentage >= 100) {
    return true;
  }
  
  // No rollout
  if (percentage <= 0) {
    return false;
  }

  // Deterministic rollout based on user ID
  const effectiveUserId = userId || getCurrentUserId();
  if (effectiveUserId) {
    // Create deterministic hash
    const hash = crypto.createHash('md5').update(effectiveUserId).digest('hex');
    const userBucket = parseInt(hash.substring(0, 8), 16) % 100;
    return userBucket < percentage;
  }

  // Fallback to percentage (for server-side without user context)
  return percentage >= 50; // Conservative default
}

/**
 * Get the enrichment API endpoint based on feature flags
 */
export function getEnrichmentEndpoint(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const v2Enabled = isV2EnrichmentEnabled();
  
  return v2Enabled 
    ? `${baseUrl}/api/jobs/enrich/v2`
    : `${baseUrl}/api/jobs/enrich`;
}

/**
 * Log feature flag decision for monitoring
 */
export function logFeatureFlagDecision(
  feature: string, 
  enabled: boolean, 
  userId?: string,
  metadata?: Record<string, any>
): void {
  // In production, this would send to analytics/monitoring service
  if (process.env.NODE_ENV === 'development') {
    console.debug('[FeatureFlag]', {
      feature,
      enabled,
      userId,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }
}

/**
 * Hook for React components to use feature flags
 */
export function useV2Enrichment(): {
  enabled: boolean;
  endpoint: string;
  userId?: string;
} {
  const userId = getCurrentUserId();
  const enabled = isV2EnrichmentEnabled(userId);
  const endpoint = getEnrichmentEndpoint();

  // Log decision for monitoring
  if (typeof window !== 'undefined') {
    logFeatureFlagDecision('v2-enrichment', enabled, userId, {
      endpoint,
      rolloutPercentage: process.env.V2_ROLLOUT_PERCENTAGE
    });
  }

  return { enabled, endpoint, userId };
}

// Export feature flag names as constants
export const FEATURE_FLAGS = {
  V2_ENRICHMENT: 'v2-enrichment',
  ENRICHMENT_AUDIT_UI: 'enrichment-audit-ui'
} as const;

// Check if audit UI is enabled
export function isEnrichmentAuditUIEnabled(): boolean {
  return process.env.ENABLE_ENRICHMENT_AUDIT_UI === 'true';
}