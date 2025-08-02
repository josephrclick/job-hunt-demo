import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/jobs/[id] - Update a specific job
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate job ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Extract and validate fields that can be updated
    const allowedFields = ['title', 'company', 'description', 'location', 'employment_type', 'experience_level', 'salary'];
    const updateData: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Validate specific fields
    if ('title' in updateData) {
      if (typeof updateData.title !== 'string' || !updateData.title.trim()) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.title = updateData.title.trim();
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Create Supabase client
    const supabase = await createClient();

    // Update the job
    const { data: job, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating job:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in PATCH /api/jobs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/jobs/[id] - Get a specific job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate job ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get the job with enrichment data
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        enrichment:job_enrichments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/jobs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}