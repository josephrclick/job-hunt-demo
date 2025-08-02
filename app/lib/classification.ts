/**
 * Document Classification Service
 * Handles AI-powered document type classification using few-shot prompting
 */

import OpenAI from 'openai';
import { 
  ClassificationRequest, 
  ClassificationResult, 
  FEW_SHOT_EXAMPLES, 
  DOCUMENT_TAXONOMY,
  ALL_DOCUMENT_TYPES,
  CONFIDENCE_THRESHOLDS,
  CLASSIFICATION_MODELS 
} from '@/app/types/classification';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate few-shot classification prompt
 */
function generateClassificationPrompt(content: string, sourceHint?: string): string {
  const taxonomyJson = JSON.stringify(DOCUMENT_TAXONOMY, null, 2);
  
  const examplesText = FEW_SHOT_EXAMPLES
    .map(example => `Content: "${example.content}"\nClassification: ${example.classification}`)
    .join('\n\n');

  const sourceHintText = sourceHint ? `\nSource Hint: ${sourceHint}` : '';

  return `You are a document classification expert. Classify the document into exactly one category from the provided taxonomy.

EXAMPLES:
${examplesText}

TAXONOMY:
${taxonomyJson}

CONTENT:
---
${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}${sourceHintText}
---

Respond with a valid JSON object in this exact format:
{
  "documentType": "category/subcategory",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this classification was chosen"
}

The documentType must be exactly one of the valid types from the taxonomy. Confidence should be between 0.0 and 1.0.`;
}

/**
 * Classify a single document using GPT-4o-mini
 */
export async function classifyDocument(
  request: ClassificationRequest
): Promise<ClassificationResult> {
  try {
    const prompt = generateClassificationPrompt(request.content, request.sourceHint);

    const response = await openai.chat.completions.create({
      model: CLASSIFICATION_MODELS.GPT_4O_MINI,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.1, // Low temperature for consistency
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      throw new Error(`Failed to parse OpenAI response as JSON: ${responseText}`);
    }

    // Validate the response
    const documentType = parsed.documentType;
    const confidence = parsed.confidence;

    if (!documentType || typeof documentType !== 'string') {
      throw new Error('Invalid documentType in response');
    }

    if (!ALL_DOCUMENT_TYPES.includes(documentType as typeof ALL_DOCUMENT_TYPES[number])) {
      throw new Error(`Invalid document type: ${documentType}`);
    }

    if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
      throw new Error('Invalid confidence score');
    }

    return {
      documentType,
      confidence,
      model: CLASSIFICATION_MODELS.GPT_4O_MINI,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {

    throw new Error(`Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Rule-based pre-classification for known patterns
 * Returns classification result if confident, null otherwise
 */
export function preClassifyDocument(
  content: string, 
  sourceHint?: string
): ClassificationResult | null {
  const lowerContent = content.toLowerCase();
  const firstLine = content.split('\n')[0]?.toLowerCase() || '';

  // Email detection
  if (sourceHint === 'email' || firstLine.includes('subject:') || lowerContent.includes('from:') && lowerContent.includes('to:')) {
    return {
      documentType: 'communication/email',
      confidence: 0.95,
      model: 'rule-based',
      timestamp: new Date().toISOString(),
    };
  }

  // Calendar event detection
  if (lowerContent.includes('calendar') || lowerContent.includes('meeting moved') || lowerContent.includes('event:')) {
    return {
      documentType: 'communication/calendar-update',
      confidence: 0.90,
      model: 'rule-based',
      timestamp: new Date().toISOString(),
    };
  }

  // Job description detection
  if ((lowerContent.includes('job') || lowerContent.includes('position')) && 
      (lowerContent.includes('requirements') || lowerContent.includes('responsibilities') || lowerContent.includes('salary'))) {
    return {
      documentType: 'job-related/job-description',
      confidence: 0.85,
      model: 'rule-based',
      timestamp: new Date().toISOString(),
    };
  }

  // Technical documentation detection
  if (lowerContent.includes('# ') && (lowerContent.includes('api') || lowerContent.includes('documentation') || lowerContent.includes('## overview'))) {
    return {
      documentType: 'reference/technical-doc',
      confidence: 0.88,
      model: 'rule-based',
      timestamp: new Date().toISOString(),
    };
  }

  // No confident rule-based classification
  return null;
}

/**
 * Main classification function with rule-based pre-filtering
 */
export async function classifyDocumentHybrid(
  request: ClassificationRequest
): Promise<ClassificationResult> {
  // Try rule-based classification first
  const ruleBasedResult = preClassifyDocument(request.content, request.sourceHint);
  
  if (ruleBasedResult && ruleBasedResult.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {

    return ruleBasedResult;
  }

  // Fall back to AI classification

  return await classifyDocument(request);
}

/**
 * Batch classify multiple documents
 */
export async function classifyDocumentsBatch(
  documents: Array<{
    id: string;
    content: string;
    sourceHint?: string;
    metadata?: Record<string, unknown>;
  }>
): Promise<Array<{
  id: string;
  classification?: ClassificationResult;
  error?: string;
}>> {
  const results = await Promise.allSettled(
    documents.map(async (doc) => ({
      id: doc.id,
      classification: await classifyDocumentHybrid({
        content: doc.content,
        sourceHint: doc.sourceHint,
        metadata: doc.metadata,
      }),
    }))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        id: documents[index].id,
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
      };
    }
  });
}

/**
 * Get document type hierarchy for a given type
 */
export function getDocumentTypeHierarchy(documentType: string): string[] {
  const parts = documentType.split('/');
  const hierarchy: string[] = [];
  
  for (let i = 1; i <= parts.length; i++) {
    hierarchy.push(parts.slice(0, i).join('/'));
  }
  
  return hierarchy;
}

/**
 * Check if a document type is valid
 */
export function isValidDocumentType(documentType: string): boolean {
  return ALL_DOCUMENT_TYPES.includes(documentType as typeof ALL_DOCUMENT_TYPES[number]);
}

/**
 * Get all subcategories for a parent category
 */
export function getSubcategories(parentCategory: string): string[] {
  return ALL_DOCUMENT_TYPES.filter(type => 
    type.startsWith(parentCategory + '/') && 
    type.split('/').length === parentCategory.split('/').length + 1
  );
}