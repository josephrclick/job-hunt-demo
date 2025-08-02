/**
 * Document Classification Types & Schemas
 */
import { z } from "zod";

// Document Type Classification
export const DocumentTypeSchema = z.string().regex(
  /^[a-z-]+(?:\/[a-z-]+)*$/,
  "Document type must be lowercase with forward slashes (e.g., 'communication/email')"
);

export const ClassificationRequestSchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
  sourceHint: z.string().optional().describe("Source hint like 'email', 'upload', 'scrape'"),
  metadata: z.record(z.unknown()).optional(),
});

export const ClassificationResultSchema = z.object({
  documentType: DocumentTypeSchema,
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.object({
    type: DocumentTypeSchema,
    confidence: z.number().min(0).max(1),
  })).optional(),
  model: z.string(),
  timestamp: z.string(),
});

export const BatchClassificationRequestSchema = z.object({
  documents: z.array(z.object({
    id: z.string().uuid(),
    content: z.string().min(1),
    sourceHint: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  })).min(1).max(100), // Limit batch size
});

export const BatchClassificationResultSchema = z.object({
  results: z.array(z.object({
    id: z.string().uuid(),
    classification: ClassificationResultSchema.optional(),
    error: z.string().optional(),
  })),
  processed: z.number(),
  failed: z.number(),
});

export const FeedbackRequestSchema = z.object({
  embeddingId: z.string().uuid(),
  originalType: DocumentTypeSchema,
  correctedType: DocumentTypeSchema,
  feedbackType: z.enum(['correct', 'incorrect', 'ambiguous']),
  notes: z.string().optional(),
});

export const SearchWithTypeFilterSchema = z.object({
  query: z.string().min(1),
  documentTypes: z.array(DocumentTypeSchema).optional(),
  minConfidence: z.number().min(0).max(1).default(0.8),
  entityType: z.enum(['job']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

// Document Type Taxonomy
export const DOCUMENT_TAXONOMY = {
  communication: [
    'communication/email',
    'communication/chat-message',
    'communication/meeting-notes',
    'communication/calendar-update',
    'communication/phone-call',
  ],
  reference: [
    'reference/technical-doc',
    'reference/company-info',
    'reference/process-guide',
    'reference/research-paper',
    'reference/tutorial',
  ],
  'job-related': [
    'job-related/job-description',
    'job-related/resume',
    'job-related/interview-notes',
    'job-related/application-status',
    'job-related/company-research',
    'job-related/salary-info',
  ],
  personal: [
    'personal/note',
    'personal/task',
    'personal/idea',
    'personal/reminder',
    'personal/reflection',
  ],
  external: [
    'external/scraped-content',
    'external/imported-document',
    'external/api-data',
    'external/web-article',
  ],
} as const;

// Flatten taxonomy for validation
export const ALL_DOCUMENT_TYPES = Object.values(DOCUMENT_TAXONOMY).flat();

// Type inference
export type ClassificationRequest = z.infer<typeof ClassificationRequestSchema>;
export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;
export type BatchClassificationRequest = z.infer<typeof BatchClassificationRequestSchema>;
export type BatchClassificationResult = z.infer<typeof BatchClassificationResultSchema>;
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;
export type SearchWithTypeFilter = z.infer<typeof SearchWithTypeFilterSchema>;
export type DocumentType = typeof ALL_DOCUMENT_TYPES[number];

// Few-shot examples for prompt engineering
export const FEW_SHOT_EXAMPLES = [
  {
    content: "Subject: Re: Q4 Planning Meeting - agenda items needed for tomorrow's session",
    classification: "communication/email",
  },
  {
    content: "# API Documentation for User Authentication Service\n\n## Overview\nThis document outlines the authentication endpoints...",
    classification: "reference/technical-doc",
  },
  {
    content: "Senior Software Engineer - Python/Django (Remote)\nCompany: TechCorp\nLocation: Remote (US timezone)\nSalary: $120k-$160k\n\nWe are looking for an experienced backend engineer...",
    classification: "job-related/job-description",
  },
  {
    content: "Meeting with Sarah from TechCorp went really well. Technical questions focused on system design and Python experience. Next step is final round with the team lead.",
    classification: "job-related/interview-notes",
  },
  {
    content: "Remember to review John's pull request before EOD. Also need to update the deployment scripts for the new environment variables.",
    classification: "personal/task",
  },
  {
    content: "TechCorp Company Research:\n- Founded in 2018\n- Series B funded ($50M)\n- ~200 employees\n- Known for strong engineering culture\n- Recent product launches in AI space",
    classification: "job-related/company-research",
  },
  {
    content: "Team standup notes:\n- Sprint planning tomorrow at 10am\n- Demo scheduled for Friday\n- Blocker: waiting for design approval on checkout flow",
    classification: "communication/meeting-notes",
  },
  {
    content: "Calendar Update: Backend Team Retrospective moved to Thursday 2pm due to conflict with all-hands meeting",
    classification: "communication/calendar-update",
  },
  {
    content: "Scraped from LinkedIn: '10 Best Practices for React Performance Optimization' - article covers memoization, code splitting, and bundle analysis techniques",
    classification: "external/web-article",
  },
  {
    content: "Great idea for the mobile app: implement swipe gestures for quick actions like mark as done, archive, or snooze. Could significantly improve UX for power users.",
    classification: "personal/idea",
  },
] as const;

// Confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.9,
  MEDIUM: 0.8,
  LOW: 0.6,
  MINIMUM: 0.5,
} as const;

// Model names
export const CLASSIFICATION_MODELS = {
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4O: 'gpt-4o',
  LLAMA_3_8B: 'llama-3-8b-finetuned',
} as const;