'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function CompanyVisitTracker() {
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [company, setCompany] = useState('');

  useEffect(() => {
    // Simple page view tracking
    const logVisit = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email?.includes('@jobhuntdemo.com')) {
        const companyName = user.email.split('@')[0];
        setIsDemoUser(true);
        setCompany(companyName);
        console.log(`Demo visit: ${companyName} at ${new Date().toISOString()}`);
        
        // Optional: You could add this to a simple visits table later
        // For now, just console logging for simplicity
      }
    };
    
    logVisit();
  }, []);

  if (!isDemoUser) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <p className="text-sm text-blue-800 text-center">
        📋 Demo Mode - Welcome {company.charAt(0).toUpperCase() + company.slice(1)} team! 
        You&apos;re viewing Joe&apos;s Job Hunt Hub portfolio
      </p>
    </div>
  );
}