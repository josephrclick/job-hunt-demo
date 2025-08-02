/**
 * Unified Chunking System
 * Consolidates chunkText and chunkJobDescription into a single, configurable implementation
 * Phase 3: Added token-aware chunking for precise OpenAI API compatibility
 */

import { getEncoding, type Tiktoken } from "js-tiktoken";
import logger from "./utils/logger";

export interface ChunkingOptions {
  maxChunkSize?: number;
  contextPrefix?: string;
  cleanAsciiOnly?: boolean;
  preserveSections?: boolean;
}

export interface TokenAwareChunkingOptions {
  maxTokens: number;
  encoding: string;
  contextPrefix?: string;
  cleanAsciiOnly?: boolean;
  preserveSections?: boolean;
}

export interface ChunkResult {
  chunks: string[];
  totalChunks: number;
  metadata: {
    originalLength: number;
    cleanedLength: number;
    strategy: string;
  };
}

/**
 * Dual-path chunking function supporting both character-based (legacy) and token-aware chunking
 * @param text - Text to chunk
 * @param options - Either ChunkingOptions (legacy) or TokenAwareChunkingOptions (new)
 * @returns ChunkResult with chunks and metadata
 */
export function chunkTextUnified(
  text: string, 
  options: ChunkingOptions | TokenAwareChunkingOptions = {}
): ChunkResult {
  // Check if this is token-aware chunking
  if ('maxTokens' in options && 'encoding' in options) {
         logger.info(`Using token-aware chunking: maxTokens=${options.maxTokens}, encoding=${options.encoding}`);
    return chunkByTokens(text, options);
  } else {
    // Legacy character-based chunking
    if (options.maxChunkSize) {
      logger.warn('DEPRECATION WARNING: Character-based chunking is deprecated. Consider using token-aware chunking for better accuracy.');
    }
    return chunkByCharacters(text, options as ChunkingOptions);
  }
}

/**
 * Token-aware chunking implementation using tiktoken for precise token counting
 */
function chunkByTokens(
  text: string,
  options: TokenAwareChunkingOptions
): ChunkResult {
  const {
    maxTokens,
    encoding: encodingName,
    contextPrefix = '',
    cleanAsciiOnly = false,
    preserveSections = true
  } = options;

  const originalLength = text.length;
  
  // Apply text cleaning based on options
  const cleaned = cleanAsciiOnly 
    ? cleanAsciiOnlyText(text)
    : cleanGenericText(text);
  
  const cleanedLength = cleaned.length;
  
  // Initialize tokenizer
  let tokenizer: Tiktoken;
  try {
    tokenizer = getEncoding(encodingName as Parameters<typeof getEncoding>[0]);
  } catch (error) {
    throw new Error(`Failed to initialize tokenizer for encoding '${encodingName}': ${error}`);
  }

  // Choose chunking strategy based on content characteristics
  const strategy = preserveSections && hasSections(cleaned) 
    ? 'token-section-aware' 
    : 'token-paragraph-aware';
  
  const chunks = preserveSections 
    ? chunkWithTokenSectionAwareness(cleaned, maxTokens, contextPrefix, tokenizer)
    : chunkWithTokenParagraphAwareness(cleaned, maxTokens, contextPrefix, tokenizer);
  
  return {
    chunks: chunks.length > 0 ? chunks : [contextPrefix + cleaned.slice(0, maxTokens * 4)], // Rough fallback
    totalChunks: chunks.length,
    metadata: {
      originalLength,
      cleanedLength,
      strategy
    }
  };
}

/**
 * Legacy character-based chunking (original implementation)
 */
function chunkByCharacters(
  text: string, 
  options: ChunkingOptions = {}
): ChunkResult {
  const {
    maxChunkSize = 800,
    contextPrefix = '',
    cleanAsciiOnly = false,
    preserveSections = true
  } = options;

  const originalLength = text.length;
  
  // Apply text cleaning based on options
  const cleaned = cleanAsciiOnly 
    ? cleanAsciiOnlyText(text)
    : cleanGenericText(text);
  
  const cleanedLength = cleaned.length;
  
  // Choose chunking strategy based on content characteristics
  const strategy = preserveSections && hasSections(cleaned) 
    ? 'section-aware' 
    : 'paragraph-aware';
  
  const chunks = preserveSections 
    ? chunkWithSectionAwareness(cleaned, maxChunkSize, contextPrefix)
    : chunkWithParagraphAwareness(cleaned, maxChunkSize, contextPrefix);
  
  return {
    chunks: chunks.length > 0 ? chunks : [contextPrefix + cleaned.slice(0, maxChunkSize)],
    totalChunks: chunks.length,
    metadata: {
      originalLength,
      cleanedLength,
      strategy
    }
  };
}

/**
 * Token-aware section chunking that preserves semantic boundaries while respecting token limits
 */
function chunkWithTokenSectionAwareness(
  text: string,
  maxTokens: number,
  contextPrefix: string,
  tokenizer: Tiktoken
): string[] {
  const chunks: string[] = [];
  const contextPrefixTokens = contextPrefix ? tokenizer.encode(contextPrefix).length : 0;
  const availableTokens = maxTokens - contextPrefixTokens;

  // Split into logical sections
  const sections = text.split(/\n\s*\n/).filter(section => section.trim().length > 0);
  
  let currentChunk = contextPrefix;
  let currentTokens = contextPrefixTokens;

  for (const section of sections) {
    const sectionText = section.trim();
    const sectionTokens = tokenizer.encode(sectionText).length;
    
    // If this section alone exceeds available tokens, split it further
    if (sectionTokens > availableTokens) {
      // Save current chunk if it has content
      if (currentTokens > contextPrefixTokens) {
        chunks.push(currentChunk.trim());
        currentChunk = contextPrefix;
        currentTokens = contextPrefixTokens;
      }
      
      // Split large section by sentences using token-aware sentence splitting
      const sentenceChunks = chunkSectionByTokenSentences(sectionText, availableTokens, tokenizer);
      for (const sentenceChunk of sentenceChunks) {
        chunks.push(contextPrefix + sentenceChunk);
      }
    } else {
      // Check if adding this section would exceed token limit
      if (currentTokens + sectionTokens > maxTokens) {
        // Save current chunk and start new one
        if (currentTokens > contextPrefixTokens) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = contextPrefix + sectionText + '\n\n';
        currentTokens = contextPrefixTokens + sectionTokens;
      } else {
        // Add section to current chunk
        currentChunk += sectionText + '\n\n';
        currentTokens += sectionTokens;
      }
    }
  }
  
  // Add final chunk if it has content
  if (currentTokens > contextPrefixTokens) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Token-aware paragraph chunking (parallel to character-based approach)
 */
function chunkWithTokenParagraphAwareness(
  text: string,
  maxTokens: number,
  contextPrefix: string,
  tokenizer: Tiktoken
): string[] {
  const chunks: string[] = [];
  const contextPrefixTokens = contextPrefix ? tokenizer.encode(contextPrefix).length : 0;
  const availableTokens = maxTokens - contextPrefixTokens;

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  let current = contextPrefix;
  let currentTokens = contextPrefixTokens;

  for (const para of paragraphs) {
    const paraTokens = tokenizer.encode(para).length;

    if (paraTokens > availableTokens) {
      // Save current chunk if it has content
      if (currentTokens > contextPrefixTokens) {
        chunks.push(current.trim());
        current = contextPrefix;
        currentTokens = contextPrefixTokens;
      }

      // Split large paragraph by sentences using token-aware splitting
      const sentenceChunks = chunkSectionByTokenSentences(para, availableTokens, tokenizer);
      for (const sentenceChunk of sentenceChunks) {
        chunks.push(contextPrefix + sentenceChunk);
      }
    } else {
      // Check if adding this paragraph would exceed token limit
      if (currentTokens + paraTokens > maxTokens) {
        if (currentTokens > contextPrefixTokens) {
          chunks.push(current.trim());
        }
        current = contextPrefix + para + '\n\n';
        currentTokens = contextPrefixTokens + paraTokens;
      } else {
        current += para + '\n\n';
        currentTokens += paraTokens;
      }
    }
  }
  
  if (currentTokens > contextPrefixTokens) {
    chunks.push(current.trim());
  }
  
  return chunks;
}

/**
 * Split a large section by sentences with token awareness
 */
function chunkSectionByTokenSentences(
  text: string,
  maxTokens: number,
  tokenizer: Tiktoken
): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceText = sentence.trim() + '.';
    const sentenceTokens = tokenizer.encode(sentenceText).length;
    
    // If single sentence exceeds max tokens, split it at token level
    if (sentenceTokens > maxTokens) {
      // Save current chunk if it has content
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }
      
      // Split oversized sentence by tokens (last resort)
      const tokenChunks = chunkByTokenArray(sentenceText, maxTokens, tokenizer);
      chunks.push(...tokenChunks);
    } else {
      // Check if adding this sentence would exceed token limit
      if (currentTokens + sentenceTokens > maxTokens) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentenceText + ' ';
        currentTokens = sentenceTokens;
      } else {
        currentChunk += sentenceText + ' ';
        currentTokens += sentenceTokens;
      }
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text.slice(0, maxTokens * 4)]; // Rough fallback
}

/**
 * Last resort: split text by token arrays for oversized sentences
 */
function chunkByTokenArray(
  text: string,
  maxTokens: number,
  tokenizer: Tiktoken
): string[] {
  const tokens = tokenizer.encode(text);
  const chunks: string[] = [];
  
  for (let i = 0; i < tokens.length; i += maxTokens) {
    const tokenChunk = tokens.slice(i, i + maxTokens);
    const textChunk = tokenizer.decode(tokenChunk);
    chunks.push(textChunk);
  }
  
  return chunks;
}

// REMOVED: chunkJobDescription - Use chunkTextUnified directly with appropriate options

/**
 * Generic text chunking (backward compatible with original chunkText)
 */
export function chunkText(text: string, maxChunkSize: number = 800): string[] {
  const result = chunkTextUnified(text, {
    maxChunkSize,
    contextPrefix: '',
    cleanAsciiOnly: false,
    preserveSections: true
  });
  
  return result.chunks;
}

/**
 * Token-aware text chunking - Primary interface for new implementations
 * @param text - Text to chunk
 * @param maxTokens - Maximum tokens per chunk (respects model limits)
 * @param encoding - Tiktoken encoding name (e.g., 'cl100k_base')
 * @param options - Additional chunking options
 * @returns Array of text chunks guaranteed to not exceed maxTokens
 */
export function chunkTextByTokens(
  text: string,
  maxTokens: number,
  encoding: string,
  options: {
    contextPrefix?: string;
    cleanAsciiOnly?: boolean;
    preserveSections?: boolean;
  } = {}
): string[] {
  const result = chunkTextUnified(text, {
    maxTokens,
    encoding,
    contextPrefix: options.contextPrefix || '',
    cleanAsciiOnly: options.cleanAsciiOnly || false,
    preserveSections: options.preserveSections !== false
  });
  
  return result.chunks;
}

/**
 * Token-aware job description chunking with context
 * @param description - Job description text
 * @param title - Job title
 * @param company - Company name
 * @param maxTokens - Maximum tokens per chunk
 * @param encoding - Tiktoken encoding name
 * @returns Array of text chunks with job context prefix
 */
// REMOVED: chunkJobDescriptionByTokens - Use chunkTextByTokens directly with appropriate options

/**
 * ASCII-only text cleaning (for job descriptions)
 */
function cleanAsciiOnlyText(text: string): string {
  return text
    .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-ASCII except newlines
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generic text cleaning (preserves unicode)
 */
function cleanGenericText(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/\uFFFD/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w{100,}\b/g, " ")
    .trim();
}

/**
 * Detect if text has section-like structure
 */
function hasSections(text: string): boolean {
  // Look for section indicators
  const sectionPatterns = [
    /^\s*\w+:\s*$/m,                    // "Requirements:", "Responsibilities:"
    /^\s*\d+\.\s+/m,                    // "1. Something"
    /^\s*[A-Z][A-Z\s]{2,}:\s*$/m,      // "JOB REQUIREMENTS:"
    /^\s*#{1,6}\s+/m,                   // Markdown headers
  ];
  
  return sectionPatterns.some(pattern => pattern.test(text));
}

/**
 * Section-aware chunking that tries to keep sections together
 */
function chunkWithSectionAwareness(
  text: string, 
  maxChunkSize: number, 
  contextPrefix: string
): string[] {
  const chunks: string[] = [];
  
  // Split into logical sections
  const sections = text.split(/\n\s*\n/).filter(section => section.trim().length > 0);
  
  let currentChunk = contextPrefix;
  
  for (const section of sections) {
    const sectionText = section.trim();
    
    // If this section alone would exceed chunk size, split it further
    if (sectionText.length > maxChunkSize) {
      // Save current chunk if it has content
      if (currentChunk.length > contextPrefix.length) {
        chunks.push(currentChunk.trim());
        currentChunk = contextPrefix;
      }
      
      // Split large section by sentences
      const sentences = sectionText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      for (const sentence of sentences) {
        const sentenceText = sentence.trim() + '.';
        
        if ((currentChunk + sentenceText).length > maxChunkSize) {
          if (currentChunk.length > contextPrefix.length) {
            chunks.push(currentChunk.trim());
            currentChunk = contextPrefix + sentenceText + ' ';
          } else {
            // Even single sentence is too long, force split by words
            currentChunk += chunkByWords(sentenceText, maxChunkSize - contextPrefix.length)[0];
          }
        } else {
          currentChunk += sentenceText + ' ';
        }
      }
    } else {
      // Check if adding this section would exceed chunk size
      if ((currentChunk + sectionText).length > maxChunkSize) {
        // Save current chunk and start new one
        if (currentChunk.length > contextPrefix.length) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = contextPrefix + sectionText + '\n\n';
      } else {
        // Add section to current chunk
        currentChunk += sectionText + '\n\n';
      }
    }
  }
  
  // Add final chunk if it has content
  if (currentChunk.length > contextPrefix.length) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Paragraph-aware chunking (original chunkText logic)
 */
function chunkWithParagraphAwareness(
  text: string, 
  maxChunkSize: number, 
  contextPrefix: string
): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let current = contextPrefix;

  for (const para of paragraphs) {
    if (para.length > maxChunkSize) {
      if (current.trim()) {
        chunks.push(current.trim());
        current = contextPrefix;
      }
      const sentences = para.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      for (const sentence of sentences) {
        const s = sentence.trim() + ".";
        if ((current + s).length > maxChunkSize) {
          if (current.trim()) {
            chunks.push(current.trim());
            current = contextPrefix + s + " ";
          } else {
            // Word-level splitting for oversized sentences
            const wordChunks = chunkByWords(s, maxChunkSize - contextPrefix.length);
            chunks.push(...wordChunks.map(chunk => contextPrefix + chunk));
            current = contextPrefix;
          }
        } else {
          current += s + " ";
        }
      }
    } else {
      if ((current + para).length > maxChunkSize) {
        if (current.trim()) {
          chunks.push(current.trim());
        }
        current = contextPrefix + para + "\n\n";
      } else {
        current += para + "\n\n";
      }
    }
  }
  
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/**
 * Split text by words when all else fails
 */
function chunkByWords(text: string, maxSize: number): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let current = '';
  
  for (const word of words) {
    if ((current + word).length > maxSize) {
      if (current.trim()) {
        chunks.push(current.trim());
        current = word + ' ';
      } else {
        // Single word is too long, just truncate it
        chunks.push(word.slice(0, maxSize));
      }
    } else {
      current += word + ' ';
    }
  }
  
  if (current.trim()) {
    chunks.push(current.trim());
  }
  
  return chunks.length > 0 ? chunks : [text.slice(0, maxSize)];
}

// Note: chunkText and chunkJobDescription are exported above for backward compatibility