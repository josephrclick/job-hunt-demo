import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return new NextResponse('Missing jobId parameter', { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: job, error } = await supabase
    .from('jobs')
    .select('company')
    .eq('id', jobId)
    .single();

  if (error || !job) {

    return new NextResponse('Job not found', { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'public', 'resume', 'master.pdf');
  let fileBuffer: Buffer;

  try {
    fileBuffer = await fs.readFile(filePath);
  } catch {
    return new NextResponse('Resume file not found', { status: 500 });
  }

  const safeCompany = job.company?.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim() || 'Company';
  const filename = `Resume of Joseph Click - ${safeCompany}.PDF`;

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}