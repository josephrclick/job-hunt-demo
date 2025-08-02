# Resume Directory

This directory contains resume data used by the Job Hunt Hub application for personalization and document generation.

## Setup Instructions

1. **Copy the example file**: 
   ```bash
   cp resume-example.json resume.json
   ```

2. **Update with your personal information**:
   - Edit `resume.json` with your actual details
   - Replace all example data with your real information
   - Ensure all fields are accurately filled

3. **Add your PDF resume**:
   - Place your master resume PDF file here as `master.pdf`
   - This will be used for company-specific resume generation

## File Descriptions

### `resume.json`
This JSON file contains structured resume data that the application uses to:
- Personalize AI-powered job analysis and fit scoring
- Generate tailored cover letters and resumes
- Match your skills and preferences against job postings
- Create company-specific application materials

The file includes:
- Personal information (name, contact, location)
- Professional summary
- Skills and expertise
- Work experience
- Education and certifications
- Career values and preferences
- Preferred/undesired industries
- Work environment preferences

### `master.pdf`
Your current resume in PDF format, used by the `/api/jobs/generate-resume` endpoint to:
1. Read the PDF file from this directory
2. Rename it to include the target company name
3. Serve it as a download with personalized filename

## Important Notes

- The `resume.json` file is gitignored by default for privacy
- Never commit your personal `resume.json` to version control
- Keep your resume data up-to-date for accurate job matching
- The application uses this data to provide personalized insights and recommendations