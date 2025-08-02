"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JobRow } from "@/app/types/job";

export default function NewNotePage() {
  const [jobs, setJobs] = useState<Pick<JobRow, "id" | "title" | "company">[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [content, setContent] = useState("");
  const [isBlocker, setIsBlocker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Job-specific files
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const supabase = createClient();

  const loadJobs = useCallback(async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id, title, company")
      .order("company")
      .order("title");
    setJobs(data || []);
  }, [supabase]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles = Array.from(selectedFiles).filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
        "text/markdown",
        "text/x-markdown",
        "text/vtt",
      ];

      // Also check by file extension for .md files since MIME type can vary
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const validExtensions = [
        "pdf",
        "docx",
        "doc",
        "txt",
        "md",
        "markdown",
        "vtt",
      ];

      const isValidType =
        validTypes.includes(file.type) ||
        validExtensions.includes(fileExtension || "");
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit

      return isValidType && isValidSize;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleUploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress({});

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to upload files",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // 1. Upload files to Storage in parallel with batching
      const batchSize = 5; // Process 5 files at a time to avoid overwhelming storage
      const uploads: Array<{ path: string; name: string }> = [];

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);

        const batchUploads = await Promise.all(
          batch.map(async (file) => {
            // Storage policies require files to be in user folder
            const path = `${user.id}/${crypto.randomUUID()}_${file.name}`;

            setUploadProgress((prev) => ({ ...prev, [file.name]: 10 }));

            try {
              const { error } = await supabase.storage
                .from("docs")
                .upload(path, file, { upsert: false });

              if (error) throw error;

              setUploadProgress((prev) => ({ ...prev, [file.name]: 30 }));

              return { path, name: file.name, success: true };
            } catch (error) {

              setUploadProgress((prev) => ({ ...prev, [file.name]: -1 })); // -1 indicates error
              return {
                path: "",
                name: file.name,
                success: false,
                error: error instanceof Error ? error.message : "Upload failed",
              };
            }
          }),
        );

        // Only add successful uploads
        uploads.push(
          ...batchUploads
            .filter((upload) => upload.success)
            .map(({ path, name }) => ({ path, name })),
        );

        // Small delay between batches to prevent rate limiting
        if (i + batchSize < files.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (uploads.length === 0) {
        throw new Error("No files were successfully uploaded to storage");
      }

      // 2. Process documents in smaller batches to avoid Edge Function timeouts
      const processBatchSize = 3; // Process 3 documents at a time
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < uploads.length; i += processBatchSize) {
        const batch = uploads.slice(i, i + processBatchSize);

        try {
          const response = await fetch("/api/ingest-docs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              files: batch,
              dealId: null,
              jobId: selectedJobId || null,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Processing failed");
          }

          const result = await response.json();
          successCount += result.summary?.successful || batch.length;

          // Update progress for successful files in this batch
          batch.forEach((file) => {
            setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
          });
        } catch {
          errorCount += batch.length;

          // Mark batch files as failed
          batch.forEach((file) => {
            setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
          });
        }

        // Add delay between processing batches
        if (i + processBatchSize < uploads.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Show results
      if (successCount > 0) {
        toast({
          title: "Upload completed!",
          description: `${successCount} file(s) processed successfully${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
        });
      } else {
        throw new Error("All file processing failed");
      }

      // Clear files after delay to show final status
      setTimeout(() => {
        setFiles([]);
        setUploadProgress({});
      }, 2000);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter some content",
        variant: "destructive",
      });
      return;
    }

    if (!selectedJobId) {
      toast({
        title: "Missing information",
        description: "Please select a job",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to add notes",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("job_notes")
      .insert({
        job_id: selectedJobId,
        profile_uid: user.id,
        content: content.trim(),
        is_blocker: isBlocker,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error saving note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved!",
        description: selectedJobId
          ? "Your job note has been saved"
          : "Your general note has been saved",
      });
      // Reset form
      setContent("");
      setIsBlocker(false);
    }

    setSaving(false);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Job Notes & Documents</h1>

      <div className="space-y-6">
        {/* Job Selector */}
        <div>
          <Label htmlFor="job">Job (Optional)</Label>
          <div className="flex gap-2">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job (optional)" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.company} - {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">Interview Notes / Job Research</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Interview notes, job research, application status, follow-ups..."
            className="min-h-[150px]"
          />
        </div>

        {/* Blocker */}
        <div>
          <Label htmlFor="is-blocker">Red Flag / Blocker?</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="is-blocker"
              checked={isBlocker}
              onCheckedChange={(checked) => setIsBlocker(checked === true)}
            />
            <Label htmlFor="is-blocker" className="ml-2">
              Mark as red flag or blocker
            </Label>
          </div>
        </div>

        {/* Job File Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>Job Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            >
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Drag and drop files here, or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    click to browse
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  Resumes, cover letters, job descriptions, company research (max 50MB each)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.markdown,.vtt"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({files.length})</Label>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    {uploadProgress[file.name] !== undefined && (
                      <div className="flex items-center gap-2">
                        {uploadProgress[file.name] === -1 ? (
                          <span className="text-xs text-red-600 font-medium">
                            Failed
                          </span>
                        ) : (
                          <>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  uploadProgress[file.name] === 100
                                    ? "bg-green-600"
                                    : "bg-blue-600"
                                }`}
                                style={{
                                  width: `${Math.max(0, uploadProgress[file.name])}%`,
                                }}
                              />
                            </div>
                            <span
                              className={`text-xs ${
                                uploadProgress[file.name] === 100
                                  ? "text-green-600 font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              {uploadProgress[file.name] === 100
                                ? "Done"
                                : `${uploadProgress[file.name]}%`}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    {!uploading && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <Button
                onClick={handleUploadFiles}
                disabled={uploading || files.length === 0}
                className="w-full"
              >
                {uploading
                  ? `Uploading ${files.length} file(s)...`
                  : `Upload ${files.length} file(s)`}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Save Note Button */}
        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saving || !content.trim()}>
            {saving ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </div>
    </div>
  );
}