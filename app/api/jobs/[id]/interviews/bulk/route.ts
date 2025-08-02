import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InterviewRoundInsert } from '@/types/interview';
import { z } from 'zod';

// Validation schema for bulk operations
const BulkInterviewRoundSchema = z.object({
  rounds: z.array(z.object({
    round_number: z.number().min(1).max(8),
    stage: z.enum(['not_started', 'phone_screen', 'technical_1', 'technical_2', 'behavioral', 'onsite', 'system_design', 'final', 'offer', 'completed']),
    status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show']).optional(),
    scheduled_date: z.string().optional(),
    interview_format: z.enum(['video', 'phone', 'onsite', 'take_home', 'panel', 'casual']).optional(),
    interviewer_names: z.array(z.string()).optional(),
    next_steps: z.string().optional(),
    next_step_date: z.string().optional(),
    outcome: z.enum(['passed', 'failed', 'pending', 'strong_yes', 'yes', 'no', 'strong_no', 'mixed']).optional(),
    duration_minutes: z.number().optional(),
    feedback_summary: z.string().optional(),
  })),
  template: z.enum(['FAANG', 'Startup', 'Enterprise']).optional(),
});

// POST /api/jobs/[id]/interviews/bulk - Create or update multiple interview rounds
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
    // Validate job ID format
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input data
    const validation = BulkInterviewRoundSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { rounds, template } = validation.data;

    // Create Supabase client
    const supabase = await createClient();

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, company')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // If template is provided, load template rounds
    let roundsToInsert = rounds;
    if (template) {
      const { INTERVIEW_TEMPLATES } = await import('@/types/interview');
      const selectedTemplate = INTERVIEW_TEMPLATES.find(t => t.name === template);
      
      if (selectedTemplate) {
        // Map template rounds to insert format
        roundsToInsert = selectedTemplate.rounds.map(tr => ({
          round_number: tr.round_number,
          stage: tr.stage,
          interview_format: tr.interview_format,
          status: 'scheduled' as const,
          duration_minutes: tr.typical_duration_minutes,
        }));
      }
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the bulk upsert function
    const { data: insertedRounds, error: insertError } = await supabase
      .rpc('upsert_interview_rounds', {
        p_job_id: jobId,
        p_profile_uid: user.id,
        p_rounds: roundsToInsert
      });

    if (insertError) {
      console.error('Error inserting interview rounds:', insertError);
      return NextResponse.json(
        { error: 'Failed to create interview rounds' },
        { status: 500 }
      );
    }

    // Update job interview status if needed
    if (roundsToInsert.length > 0) {
      await supabase
        .from('jobs')
        .update({ 
          interview_status: 'interviewing',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
    }

    return NextResponse.json({
      success: true,
      rounds: insertedRounds,
      job: {
        id: job.id,
        title: job.title,
        company: job.company
      },
      message: `Successfully created/updated ${insertedRounds?.length || 0} interview rounds`
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/jobs/[id]/interviews/bulk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id]/interviews/bulk - Update multiple interview rounds
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
    // Validate job ID format
    if (!jobId || typeof jobId !== 'string') {
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

    const { roundIds, updates } = body;

    if (!Array.isArray(roundIds) || !updates) {
      return NextResponse.json(
        { error: 'Missing roundIds or updates' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Batch update rounds
    const { data: updatedRounds, error: updateError } = await supabase
      .from('interview_rounds')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('job_id', jobId)
      .in('id', roundIds)
      .select();

    if (updateError) {
      console.error('Error updating interview rounds:', updateError);
      return NextResponse.json(
        { error: 'Failed to update interview rounds' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rounds: updatedRounds,
      message: `Successfully updated ${updatedRounds.length} interview rounds`
    });

  } catch (error) {
    console.error('Unexpected error in PATCH /api/jobs/[id]/interviews/bulk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id]/interviews/bulk - Delete multiple interview rounds
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
    // Validate job ID format
    if (!jobId || typeof jobId !== 'string') {
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

    const { roundIds } = body;

    if (!Array.isArray(roundIds) || roundIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty roundIds array' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Delete rounds
    const { error: deleteError } = await supabase
      .from('interview_rounds')
      .delete()
      .eq('job_id', jobId)
      .in('id', roundIds);

    if (deleteError) {
      console.error('Error deleting interview rounds:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete interview rounds' },
        { status: 500 }
      );
    }

    // Check if any rounds remain
    const { count } = await supabase
      .from('interview_rounds')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    // Update job status if no rounds remain
    if (count === 0) {
      await supabase
        .from('jobs')
        .update({ 
          interview_status: 'applied',
          current_interview_stage: 'not_started',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${roundIds.length} interview rounds`
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/jobs/[id]/interviews/bulk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}