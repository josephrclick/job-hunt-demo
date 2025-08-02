'use client';

import { Suspense } from 'react';
import JobsPageContent from './JobsPageContent';

export default function JobsPageWrapper() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}