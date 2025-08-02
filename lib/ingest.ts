import { createClient } from "@supabase/supabase-js";
import { embedChunk } from "./embed";
import logger from "./utils/logger";
import mammoth from "mammoth";

/** File to ingest: storage path and original filename */
export interface FileInfo {
  path: string;
  name: string;
}

/** Result of batch ingest: inserted rows, errors, and summary */
export interface BatchIngestResult {
  inserted: Array<{
    id: string;
    title: string;
    file: string;
    snippet: string;
    success?: boolean;
    warning?: string;
  }>;
  errors: Array<{ file: string; error: string }>;
  summary: {
    total: number;
    successful: number;
    warnings: number;
    failed: number;
  };
}

// Remove PDF metadata, artifacts, and normalize whitespace
function cleanPDFText(text: string): string {
  return text
    .replace(/<x:[^>]+>[^]*?<\/x:[^>]+>/gi, "")
    .replace(/<\?xpacket[^]*?\?>/gi, "")
    .replace(/<rdf:RDF[^]*?<\/rdf:RDF>/gi, "")
    .replace(/<<[^>>]*>>/g, " ")
    .replace(/\/[A-Z][a-zA-Z0-9]*/g, " ")
    .replace(/\d+\s+\d+\s+obj/g, " ")
    .replace(/endobj/g, " ")
    .replace(/stream[\r\n]+/g, " ")
    .replace(/endstream/g, " ")
    .replace(/\\[rn]/g, " ")
    .replace(/\\[0-7]{3}/g, " ")
    .replace(/\\x[0-9A-Fa-f]{2}/g, " ")
    .replace(/[^\w\s.,!?;:()\-'\"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Simple heuristics to check readability of extracted text
function isTextReadable(text: string): boolean {
  if (!text || text.length < 20) return false;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const ratio = letters / text.length;
  const words = text.match(/\b[a-zA-Z]{2,}\b/g) || [];
  const avgLen = words.length > 0 ? words.join("").length / words.length : 0;
  return ratio > 0.5 && words.length > 5 && avgLen > 2 && avgLen < 15;
}

// OCR processing with Google Cloud Vision API (local implementation)
async function runGoogleCloudOCR(
  buffer: ArrayBuffer,
  filename: string,
): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    logger.info(`[OCR] Google Cloud Vision API key not configured for ${filename}, skipping OCR`);
    return "";
  }

  try {
    logger.info(`[OCR] Starting Google Cloud Vision OCR for ${filename}, bufferSize=${buffer.byteLength} bytes`);

    // Convert buffer to base64
    const base64 = Buffer.from(buffer).toString("base64");
    logger.debug(`[OCR] ${filename} → base64 conversion complete, base64Length=${base64.length}`);

    const requestBody = {
      requests: [
        {
          image: {
            content: base64,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 1,
            },
          ],
        },
      ],
    };

    logger.debug(`[OCR] ${filename} → sending request to Google Cloud Vision API`);
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    logger.debug(`[OCR] ${filename} → received response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[OCR] ${filename} → API error: ${response.status} - ${errorText}`);
      throw new Error(`OCR API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    const textAnnotations = result.responses?.[0]?.textAnnotations;

    if (textAnnotations && textAnnotations.length > 0) {
      const extractedText = textAnnotations[0].description || "";
      logger.info(`[OCR] ${filename} → OCR extraction successful: ${extractedText.length} characters`);
      logger.debug(`[OCR] ${filename} → OCR text preview: ${extractedText.slice(0, 200)}`);
      return extractedText;
    }

    // Check for errors in the response
    const errorDetails = result.responses?.[0]?.error;
    if (errorDetails) {
      logger.error(`[OCR] ${filename} → Vision API returned error:`, errorDetails);
    }

    logger.info(`[OCR] ${filename} → No text found in OCR response`);
    return "";
  } catch (error) {
    logger.error(`[OCR] ${filename} → OCR processing failed:`, error);
    return "";
  }
}

/** Extract text from PDF using pdf-parse, with pdfjs-dist fallback and OCR */
async function extractPDFTextRobust(
  buffer: ArrayBuffer,
  filename: string,
): Promise<string> {
  logger.info(`[PDF] Starting extraction for ${filename}, bufferSize=${buffer.byteLength} bytes`);

  try {
    logger.info(`[PDF] Attempting pdf-parse extraction for ${filename}`);

    const { default: pdf } = await import("pdf-parse/lib/pdf-parse.js");
    const data = await pdf(Buffer.from(buffer), {
      max: 20,
      version: "v1.10.100",
    });

    if (data && data.text) {
      const rawText = data.text || "";

      const cleaned = cleanPDFText(rawText);


      if (isTextReadable(cleaned)) {

        return `PDF Document: ${filename}${data.numpages ? ` (${data.numpages} pages)` : ""}\n\n${cleaned}`;
      } else {

      }
    } else {

    }
  } catch {
    // Ignore error
  }

  // Fallback: pdfjs-dist parsing if pdf-parse returned no readable text

  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    // Note: disableWorker option not available in this version
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdfDoc = await loadingTask.promise;
    let combinedText = "";
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map(
        (item: unknown) => (item as { str?: string }).str || "",
      );
      combinedText += strings.join(" ") + "\n";
    }

    const cleaned2 = cleanPDFText(combinedText);


    if (isTextReadable(cleaned2)) {

      return `PDF Document: ${filename}${pdfDoc.numPages ? ` (${pdfDoc.numPages} pages)` : ""}\n\n${cleaned2}`;
    } else {

    }
  } catch {
    // Ignore error
  }

  // Try OCR before manual fallback

  const ocrText = await runGoogleCloudOCR(buffer, filename);

  if (ocrText && ocrText.trim().length > 0) {

    return `PDF Document: ${filename}\n\nOCR Extracted Content:\n${ocrText}`;
  }

  // Final fallback: manual extraction

  return fallbackTextExtraction(buffer, filename);
}

/** Manual fallback to pull text segments from PDF buffer */
async function fallbackTextExtraction(
  buffer: ArrayBuffer,
  filename: string,
): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const str = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  const parts: string[] = [];
  const stringMatches = str.match(/\(([^)]{4,})\)/g) || [];
  for (const m of stringMatches) {
    const t = m
      .slice(1, -1)
      .replace(/\\[rn]/g, " ")
      .replace(/\\/g, "")
      .trim();
    if (t.length > 3 && /[a-zA-Z]/.test(t)) parts.push(t);
  }
  const tjMatches = str.match(/\[(.*?)\]\s*TJ/g) || [];
  for (const m of tjMatches) {
    const inner = m.match(/\[(.*?)\]/)?.[1] || "";
    const segs = inner.match(/\(([^)]+)\)/g) || [];
    for (const s of segs) {
      const txt = s.slice(1, -1).trim();
      if (txt.length > 2 && /[a-zA-Z]/.test(txt)) parts.push(txt);
    }
  }
  if (parts.length > 0) {
    const combined = cleanPDFText(parts.join(" "));
    if (isTextReadable(combined)) {
      return `PDF Document: ${filename}\n\nExtracted Content:\n${combined}`;
    }
  }
  return `PDF Document: ${filename}\n\nThis document contains non-textual or scanned content that requires manual review.`;
}

/** Generate auto-tags for document content using OpenAI */
async function generateAutoTags(
  text: string,
  filename: string,
): Promise<string[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {

    return [];
  }

  // Predefined tag list from sprint requirements
  const allowedTags = [
    "urgent",
    "transcript",
    "documentation",
    "training",
    "meeting-notes",
    "reference",
    "blocker",
    "to-do",
    "PoC",
    "demo-prep",
    "marketing",
  ];

  try {

    // Extract first 500 characters as snippet
    const snippet = text.slice(0, 500);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `You are an AI assistant. Given the following text snippet, suggest up to three tags from this allowed list (choose none if no tag applies): ${allowedTags.join(", ")}.

Text snippet:
"""
${snippet}
"""
Only respond with a comma-separated list of valid tags (e.g. "meeting-notes, reference"). If none apply, respond with an empty string.`,
          },
        ],
        max_tokens: 50,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const tagResponse = result.choices?.[0]?.message?.content || "";

    // Parse and validate tags
    const suggestedTags = tagResponse
      .split(",")
      .map((tag: string) => tag.trim().toLowerCase())
      .filter((tag: string) => allowedTags.includes(tag))
      .slice(0, 3); // Max 3 tags

    logger.info(`[TAGS] Auto-tags generated for ${filename}: ${suggestedTags.join(", ")}`);
    return suggestedTags;
  } catch {
    // Return empty array on error
    return [];
  }
}

/** Ingest multiple documents: download, parse, store, and embed */
export async function ingestDocumentsBatch(
  files: FileInfo[],
  jobId?: string | null,
  metadata?: { tags?: string[]; memo?: string; type?: string },
  userId?: string,
): Promise<BatchIngestResult> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Ensure we have a job record; if none was provided, create a new one with status 'new'
  let currentJobId: string | null = jobId ?? null;
  if (!currentJobId) {
    const { data: newJob, error: jobErr } = await supabase
      .from("jobs")
      .insert({ status: "new" })
      .select("id")
      .single();

    if (jobErr || !newJob) {
      throw new Error(
        `Failed to create placeholder job record: ${jobErr?.message || "unknown error"}`,
      );
    }
    currentJobId = (newJob as unknown as { id: string }).id;
  }

  const results: Array<Record<string, unknown>> = [];
  const concurrency = 2;
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      batch.map(async (file) => {
        try {
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          if (!["pdf", "docx", "md", "txt", "markdown", "vtt"].includes(ext)) {
            return { file: file.name, error: `Unsupported file type: ${ext}` };
          }
          const { data: download, error: dlErr } = await supabase.storage
            .from("docs")
            .download(file.path);
          if (dlErr) throw new Error(`Download failed: ${dlErr.message}`);
          const buffer = await download.arrayBuffer();
          let text = "";
          if (ext === "pdf") {
            text = await extractPDFTextRobust(buffer, file.name);
          } else if (ext === "docx") {
            try {
              const { value: extracted } = await mammoth.extractRawText({
                buffer: Buffer.from(buffer),
              });
              text = extracted.trim();
              if (text.length < 10) {
                throw new Error("DOCX parser returned too‑little text");
              }
            } catch {
              // Fallback to generic text
              text = `Word Document: ${file.name}`;
            }
          } else {
            text = new TextDecoder("utf-8").decode(buffer);
          }
          text = text
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
            .replace(/\uFFFD/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (text.length < 5) {
            text = `Document: ${file.name}\nContent extracted but minimal readable text found.`;
          }

          // Generate auto-tags for the document
          let aiTags: string[] = [];
          let aiTagError: string | null = null;

          try {
            aiTags = await generateAutoTags(text, file.name);
          } catch (error) {
            aiTagError =
              error instanceof Error ? error.message : "Auto-tagging failed";

          }

          // Prepare snippet and document data with enhanced metadata
          const snippet = text.slice(0, 500);
          const documentData = {
            job_id: currentJobId,
            profile_uid: userId || 'demo_admin', // Use provided userId or fallback to demo_admin
            title: file.name,
            doc_type: ext,
            content: text,
            doc_status: "processing" as const,
            file_size: buffer.byteLength,
            mime_type: file.name.split(".").pop()?.toLowerCase() || ext,
            tags: aiTags, // Use auto-generated tags for the tags column
            memo: metadata?.memo || null,
            metadata: metadata
              ? {
                  type: metadata.type || "document",
                  original_filename: file.name,
                  processing_started: new Date().toISOString(),
                  tags: aiTags, // Also store in metadata for reference
                  ...(aiTagError ? { ai_tag_error: aiTagError } : {}),
                  ...metadata,
                }
              : {
                  original_filename: file.name,
                  processing_started: new Date().toISOString(),
                  tags: aiTags, // Also store in metadata for reference
                  ...(aiTagError ? { ai_tag_error: aiTagError } : {}),
                },
          };

          const { data: docRow, error: insErr } = await supabase
            .from("job_documents")
            .insert(documentData)
            .select()
            .single();
          if (insErr) {

            throw new Error(`Insert failed: ${insErr.message}`);
          }
          try {
            // Prepare embedding options with metadata including auto-generated tags
            const embeddingOptions: {
              mime: string;
              title: string;
              metadata?: Record<string, unknown>;
              tags?: string[];
            } = {
              mime: ext,
              title: docRow.title,
              metadata: {
                ...metadata,
                source_type: "document",
                document_type: ext, // Help classification identify document type
                original_filename: file.name,
              },
              tags: aiTags, // Pass tags at the top level for embedChunk
            };

            await Promise.race([
              embedChunk(
                "job", // Entity type - this is a job document
                currentJobId!, // Entity ID - the job's ID (ensured above)
                "doc", // Source type - document
                docRow.id, // Source ID - the document's ID
                text,
                embeddingOptions,
              ),
              new Promise((_, rej) =>
                setTimeout(() => rej(new Error("Embedding timeout")), 30000),
              ),
            ]);

            // Mark document as successfully processed
            await supabase
              .from("job_documents")
              .update({
                doc_status: "active",
                processed_at: new Date().toISOString(),
              })
              .eq("id", docRow.id);

            return {
              id: docRow.id,
              title: docRow.title,
              file: file.name,
              success: true,
              snippet,
            };
          } catch (embErr) {
            // Mark document as failed but keep the record
            await supabase
              .from("job_documents")
              .update({
                doc_status: "failed",
                processed_at: new Date().toISOString(),
                metadata: {
                  ...docRow.metadata,
                  error_message:
                    embErr instanceof Error
                      ? embErr.message
                      : "Embedding failed",
                  failed_at: new Date().toISOString(),
                },
              })
              .eq("id", docRow.id);

            return {
              id: docRow.id,
              title: docRow.title,
              file: file.name,
              warning:
                embErr instanceof Error ? embErr.message : "Embedding failed",
              snippet,
            };
          }
        } catch (error) {
          return {
            file: file.name,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );
    for (const res of settled) {
      if (res.status === "fulfilled") {
        results.push(res.value);
      } else {
        results.push({
          file: "unknown",
          error: res.reason?.message || "Unknown error",
        });
      }
    }
  }
  const inserted = results.filter(
    (
      r,
    ): r is {
      id: string;
      title: string;
      file: string;
      snippet: string;
      success?: boolean;
      warning?: string;
    } => "id" in r && "title" in r && ("success" in r || "warning" in r),
  );
  const errors = results.filter(
    (r): r is { file: string; error: string } =>
      "error" in r && typeof r.error === "string",
  );
  return {
    inserted,
    errors,
    summary: {
      total: files.length,
      successful: results.filter((r) => "success" in r).length,
      warnings: results.filter((r) => "warning" in r).length,
      failed: results.filter((r) => "error" in r).length,
    },
  };
}
