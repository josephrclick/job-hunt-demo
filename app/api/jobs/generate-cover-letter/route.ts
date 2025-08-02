import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

/* ------------------------------------------------------------------ */
/* 1.--- Embedded Cover Letter Template                              */
/* ------------------------------------------------------------------ */
const coverLetterTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Courgette&display=swap" rel="stylesheet">

  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Courgette&display=swap');

    @page {
      margin: 1in;
      size: letter;
    }

    
    body {
      font-family: 'EB Garamond', serif;
      font-size: 12pt;
      line-height: 1.5;
      margin: 0;
      color: rgb(0, 0, 0);
    }
    
    .header-section {
      text-align: center;
      margin-bottom: 0.2in;
    }
          
    .header-name {
      font-family: 'EB Garamond', serif;
      font-weight: 700;
      font-size: 20pt; 
      line-height: 1.2;
      margin-bottom: 0.2in;
      transform: scale(1.2); 
    }

    .contact-info {
      font-family: 'EB Garamond', serif;
      font-weight: 400;
      font-size: 14pt; 
      line-height: 1.3;
      transform: scale(0.9); 
    }
        
    .contact-info a {
      color: rgb(5, 99, 193);
      text-decoration: underline;
    }
    
    .date {
      margin: 0.3in 0 0.15in 0;
    }
    
    .company {
      text-transform: uppercase;
      margin-bottom: 0.15in;
    }
    
    .job-reference {
      margin-bottom: 0.3in;
    }
    
    .letter-body {
      margin-bottom: 0.5in;
    }
    
    .signature-block {
    }
    
    .signature-yours {
      font-family: 'EB Garamond', serif;
      font-size: 12pt;
      margin-bottom: 0.1in;
    }
    
    .signature-script {
      font-family: 'Courgette', cursive;
      font-size: 20pt;
      margin-bottom: 0.1in;
    }
    
    .signature-typed {
      font-family: 'EB Garamond', serif;
      font-size: 12pt;
    }
    
    p {
      margin: 0 0 1em 0;
    }
  </style>
</head>
<body>
  <div class="header-section">
    <div class="header-name">
      Joseph R. Click
    </div>
    <div class="contact-info">
      [phone # goes here in prod] | 
      <a href="mailto:JosephRClick@gmail.com">JosephRClick@gmail.com</a> | 
      <a href="https://www.linkedin.com/in/josephclick/">linkedin.com/in/josephclick/</a>
    </div>
  </div>

  <div class="date">
    {{date}}
  </div>

  <div class="company">
    {{companyName}}
  </div>

  <div class="job-reference">
    Re: {{jobTitle}} role
  </div>

  <div class="letter-body">
    <p>Dear Hiring Team,</p>
    <p>I'm a Sales Engineer who builds things. I build tools, demo environments, APIs, systems, relationships, and trust. I've found my home in presales because it's the rare space where technical depth meets business impact and where the best solutions come from listening closely, understanding the pain, and building something that actually solves it.</p>
    <p>At Contentsquare, I've led Proof of Concept projects end-to-end, crafted bespoke demo environments, and written plenty of Python, JavaScript, and SQL to make sure every stakeholder sees the value of our solutions clearly. I've also built internal tooling and automations that save my team hours every week, because I know great Sales Engineers scale the entire org, not just their own deals.</p>
    <p>I was drawn to {{companyName}} because you work on the kind of real world technical challenges that make the job interesting and the outcomes impactful. I bring structure, urgency, and the kind of technical edge that helps teams close more deals. If you're looking for someone who adds value across the stack, I'd love to talk.</p>
  </div>

  <div class="signature-block">
    <div class="signature-yours">
      Best regards,
    </div>
    <div class="signature-script">
      Joseph R. Click
    </div>
    <div class="signature-typed">
      Joseph R. Click
    </div>
  </div>
</body>
</html>
`;

/* ------------------------------------------------------------------ */
/* 2.--- Main Handler                                                 */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return new NextResponse('Missing jobId', { status: 400 });
    }

    // ── Supabase client ───────────────────────────────────────────────
    const supabase = createServiceRoleClient();

    const { data: job, error } = await supabase
      .from('jobs')
      .select('company, title')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      console.error('❌ Job fetch error:', error);
      return new NextResponse('Job not found', { status: 404 });
    }

    // ── Build substitution map ────────────────────────────────────────
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const replacements: Record<string, string> = {
      '{{companyName}}': job.company || '',
      '{{jobTitle}}': job.title || '',
      '{{date}}': currentDate,
    };

    // ── Simple string replacement ─────────────────────────────────────
    let html = coverLetterTemplate;
    for (const [key, val] of Object.entries(replacements)) {
      html = html.replaceAll(key, val);
    }

    // ── Return HTML with client-side PDF generation ──────────────────
    const safeCompany = (job.company || 'Company')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const filename = `Cover Letter of Joseph Click - ${safeCompany}`;

    // Add client-side PDF generation script
    const htmlWithPdfGeneration = html + `
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script>
window.onload = function() {
  // Wait for fonts to load
  document.fonts.ready.then(() => {
    setTimeout(() => {
      const { jsPDF } = window.jspdf;
      
      html2canvas(document.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        width: 816,  // 8.5 inches at 96 DPI
        height: 1056 // 11 inches at 96 DPI
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save('${filename}.pdf');
        
        // Close the tab after download
        setTimeout(() => {
          window.close();
        }, 1000);
      });
    }, 500);
  });
}
</script>`;

    return new NextResponse(htmlWithPdfGeneration, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('❌ Cover letter generation error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate cover letter',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}