import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestDocumentsBatch } from "@/lib/ingest";

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to ingest documents." },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { files, jobId, metadata } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate that all files have required properties
    for (const file of files) {
      if (!file.path || !file.name) {
        return NextResponse.json(
          { error: "Invalid file format. Each file must have path and name." },
          { status: 400 },
        );
      }
    }

    // Call the local ingest helper with metadata support and user ID
    const result = await ingestDocumentsBatch(files, jobId, metadata, user.id);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
