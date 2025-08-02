-- ===================================================================
-- SEED ENRICHED DEMO DATA - COMPLETE V3 DATASET
-- 
-- Generated on: 2025-08-02T07:27:11.702Z
-- Contains: 10 jobs with complete enrichment data
-- Includes: All V3 features (SE Signals, Interview Prep, Quick Wins)
-- ===================================================================

BEGIN;

-- ====================
-- 1. CLEAR EXISTING DEMO DATA
-- ====================

DELETE FROM job_enrichments WHERE job_id IN (
  SELECT id FROM jobs WHERE owner_type = 'demo'
);
DELETE FROM jobs WHERE owner_type = 'demo';

-- ====================
-- 1.5. CREATE DEMO USER PROFILE
-- ====================

INSERT INTO user_profile (
  uid, name, current_title, seniority, location, 
  min_base_comp, remote_pref, strengths, red_flags, 
  interview_style, dealbreakers, preferences, created_at, updated_at
) VALUES (
  'demo_admin',
  'Joseph Click', 
  'Senior Sales Engineer',
  'Senior',
  'San Diego, CA',
  150000,
  'remote',
  '["PoC execution and ownership", "API integrations", "Python", "SQL", "Salesforce (Marketing Cloud & CRM)", "Technical discovery and consultative selling"]'::jsonb,
  '["Heavy enterprise politics", "Roles with unclear success criteria", "Heavy travel expected (>25% travel as part of the role)"]'::jsonb,
  'Strategic. Direct. Transparent. Confident. I lead with results.',
  '["Security clearance required", "Roles for military or defense contractors", "GovTech, EdTech, Healthcare, public service or political organizations"]'::jsonb,
  '{
    "industries": {
      "preferred": [
        "AI/ML platforms",
        "DevOps & Developer Tools", 
        "Cybersecurity",
        "Analytics / Observability",
        "Cloud Infrastructure",
        "Privacy & Compliance Tech",
        "B2B SaaS",
        "Martech",
        "Web and mobile app ecommerce"
      ],
      "undesired": [
        "Healthcare",
        "Finance", 
        "Banking",
        "Human Resources",
        "GovTech",
        "EdTech",
        "Public service",
        "Political organizations"
      ]
    },
    "company_stage": "Series B-D startup",
    "work_environment": [
      "Cross-functional collaboration with Product, Engineering, and Sales",
      "Ability to build internal tools and processes",
      "Opportunities to lead PoCs and technical evaluations", 
      "Fast-moving, modern tech stack (APIs, containers, cloud-native)",
      "Culture that rewards initiative, autonomy, and builder mindset"
    ]
  }'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (uid) DO NOTHING;

-- ====================
-- 2. INSERT JOBS
-- ====================

-- Job: Solutions Engineer, NAM at BioCatch
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  'f6af1c17-0794-46ca-921d-7ed32eae330d',
  'https://www.linkedin.com/jobs/view/4249905814',
  'Solutions Engineer, NAM',
  'BioCatch',
  '**About the job** Solutions Engineer – North America (Remote, USA/Canada) Department: Solutions & Operations Location: Remote – USA or Canada Travel: Up to 10% international travel (as needed) About BioCatch BioCatch is the global leader in Behavioral Biometrics, a cutting-edge technology that applies machine learning to analyze the digital behavior of users—how they interact physically and cognitively online—to prevent fraud and build trust. Our mission is to unlock the power of behavior to deliver actionable insights that make the digital world safer and more seamless. Trusted by over 25 of the world’s top 100 banks, BioCatch helps financial institutions fight fraud, drive digital transformation, and accelerate growth. Our Client Innovation Board—featuring leaders from American Express, Barclays, Citi Ventures, and National Australia Bank—fosters collaboration and advancement in behavioral-based fraud prevention. With 80+ patents and over a decade of behavioral data analysis, BioCatch is committed to staying ahead of tomorrow’s threats. Learn more at www.biocatch.com. Role Summary We are looking for a Solutions Engineer to join our growing North America team. This role is ideal for technically skilled professionals who thrive in dynamic environments and enjoy collaborating directly with customers. You’ll play a key role in onboarding and implementing BioCatch''s anti-fraud solutions across web and mobile applications, primarily for leading financial institutions. As a member of the global Solutions & Operations team, you will lead technical projects, provide integration support, conduct workshops, and work closely with cross-functional teams, including Product, Engineering, Data Science, Engagement, and Threat Analysis, to deliver value to our clients. Key Responsibilities • Lead the technical onboarding and implementation of BioCatch solutions for new customers and partners. • Manage end-to-end project execution, including planning, timelines, coordination, and issue resolution. • Act as the technical point of contact for clients, translating complex requirements into actionable integration steps. • Collaborate with client stakeholders (executives, project managers, developers) to ensure seamless solution deployment. • Troubleshoot technical issues across web and mobile environments, leveraging your analytical skills and tools. • Contribute to internal documentation, best practices, and client-facing technical workshops. • Partner with internal teams to continuously enhance solution delivery and customer experience. Requirements: Required Qualifications • 3+ years of experience in Solutions Engineering, Systems Integration, or Professional Services for SaaS platforms. • Strong project management skills with a keen eye for timelines, cross-functional collaboration, risk management, and follow-through. • Proven customer-facing experience, with the ability to clearly explain technical concepts to both technical and non-technical stakeholders. • Self-starter with strong problem-solving and technical troubleshooting abilities. • An analytical mindset with experience using analytics or BI tools to investigate and resolve issues. • Excellent verbal and written communication skills in English. • Strong interpersonal and teamwork skills. Preferred Qualifications • Experience with web technologies: HTML, CSS, JavaScript, Node.js, React, Angular, PHP, Python, etc. • Mobile development experience: React Native, Swift, Kotlin, Java, Flutter, Ionic, etc. • Familiarity with big data platforms/tools: SQL, Splunk, Elastic, Snowflake, etc. • Experience working with large-scale enterprise or financial institutions. • Experience conducting technical training or leading customer workshops. Why Join BioCatch? • Work with cutting-edge behavioral AI technology. • Collaborate with leading global banks and financial innovators. • Be part of a passionate, mission-driven team committed to securing the digital world. • Enjoy flexibility with a remote work environment and occasional travel opportunities. • The base pay for this position ranges from $100,000-130,000 Annual **Desired Skills and Experience** Required Qualifications • 3+ years of experience in Solutions Engineering, Systems Integration, or Professional Services for SaaS platforms. • Strong project management skills with a keen eye for timelines, cross-functional collaboration, risk management, and follow-through. • Proven customer-facing experience, with the ability to clearly explain technical concepts to both technical and non-technical stakeholders. • Self-starter with strong problem-solving and technical troubleshooting abilities. • An analytical mindset with experience using analytics or BI tools to investigate and resolve issues. • Excellent verbal and written communication skills in English. • Strong interpersonal and teamwork skills.Preferred Qualifications • Experience with web technologies: HTML, CSS, JavaScript, Node.js, React, Angular, PHP, Python, etc. • Mobile development experience: React Native, Swift, Kotlin, Java, Flutter, Ionic, etc. • Familiarity with big data platforms/tools: SQL, Splunk, Elastic, Snowflake, etc. • Experience working with large-scale enterprise or financial institutions. • Experience conducting technical training or leading customer workshops.Why Join BioCatch? • Work with cutting-edge behavioral AI technology. • Collaborate with leading global banks and financial innovators. • Be part of a passionate, mission-driven team committed to securing the digital world. • Enjoy flexibility with a remote work environment and occasional travel opportunities. *The base pay for this position ranges from $100,000-130,000 Annual',
  'New York, NY',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T06:41:09.871+00:00',
  'new',
  85,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Job: Senior Sales Engineer at Clari
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  'e9cff2aa-1177-4b10-84e9-93072b0d0900',
  'https://www.linkedin.com/jobs/view/4277840309',
  'Senior Sales Engineer',
  'Clari',
  '**About the job** Clari’s Revenue platform gives forecasting accuracy and visibility from the sales rep to the board room on revenue performance - helping them spot revenue leak to answer if they will meet, beat, or miss their sales goals. With insights like this, no wonder leading companies worldwide, including Okta, Adobe, Workday, and Zoom use Clari to drive revenue accuracy and precision. We never get tired of our customers singing our praises because it fuels us to help them continue to achieve remarkable. The next generation of revenue excellence is here…are you ready to achieve remarkable with us? About The Team The greatest CEOs, CROs, and Go-To-Market teams on the planet rely on Clari every single day to maximize revenue, accelerate growth, and nail their targets. Selling to the world’s most distinguished revenue leaders requires a team that is truly committed to mastering their craft, day in and day out. Clari’s sales team has become a destination for elite revenue professionals who want to learn from the best, take their skills to the next level, and grow into the CROs of tomorrow. About The Role Clari is hiring a Senior Sales Engineer to help expand our customer base and grow new revenue. Your day-to-day will focus on helping large, complex organizations drive greater revenue predictability across their global customer-facing, revenue teams. If you thrive in high-growth environments and want to prove you can sell to the best CROs and VPs of Sales in the world, Clari is the place for you. This is a fully remote opportunity and can be worked from any location in the United States. Responsibilities • Deliver world-class, value narrative demos to executive audiences • Understand customers’ revenue objectives and consult how to improve revenue processes to achieve them • Design and manage the technical and product strategy in deals • Own all technical aspects of the sales cycle including discovery, security, custom demonstrations, and RFP’s • Partner with cross-functional departments on strategic company projects focused on accelerating growth, expanding our market, and building for our future • Advise product teams on capabilities needed to best support prospects and customers Qualifications • 5+ years of experience in a pre-sales, customer-facing role: Solutions Engineer, Solutions Consultant, Sales Engineer, Solutions Architect, etc • Salesforce administration or development experience • Proven track record of winning software deals, with C-suite and Sales, at enterprise accounts • Experience running and managing enterprise-level proof of concepts (POC) • Experience with installing and administering SaaS applications • Working knowledge of APIs and enterprise systems architecture • Experience with the Revenue Operations landscape is plus • Working knowledge of Data Warehousing and common schema structures is a plus • Salesforce certifications is a plus • Basic JSON knowledge is a plus Perks and Benefits @ Clari • Remote-first with opportunities to work and celebrate in person • Medical, dental, vision, short & long-term disability, Life insurance, and EAP • Mental health support provided by Modern Health • Pre-IPO stock options • Well-being and professional development stipends • Retirement 401(k) plan • 100% paid parental leave, plus fertility and family planning support provided by Maven • Discretionary paid time off, monthly ‘take a break’ days, and Focus Fridays • Focus on culture: Charitable giving match, plus in-person and virtual events It is Clari’s intent to pay all Clarians competitive wages and salaries that are motivational, fair, and equitable. The goal of Clari’s compensation program is to be transparent, attract potential employees, meet the needs of all current employees and encourage employees to stay and grow at Clari. Actual compensation packages are based on several factors that are unique to each candidate, including but not limited to specific work location, skill set, depth of experience, education and certifications. The total target cash range for this position is $145,000 to $210,000 . Total target cash includes base salary and a target incentive. The total direct compensation package for this position may include stock options, benefits, stipends, perks and/or other applicable incentives. #BI-Remote You’ll often hear our CEO talk about being remarkable. To Clari, remarkable means many things. We believe in providing interesting and meaningful work in a supportive and inclusive environment - free from discrimination for everyone without regard to race, color, religion, sex, sexual orientation, national origin, age, disability, gender identity, or veteran status. Clari focuses on culture add, not culture fit, and believe we are made stronger by what makes you unique. If you are passionate about learning and excited about what we are doing, then we want to hear from you! At Clari, we are excited to welcome talented individuals to our growing team. We are actively hiring across multiple geographies and encourage you to explore opportunities on our careers page that interest you. Please note that all official communication regarding job opportunities at Clari will come from an @clari.com email address. If you receive messages on LinkedIn or other job platforms claiming to be from Clari, they may not be legitimate. To verify the authenticity of any job-related communication, please visit our official Clari Careers site.',
  'San Francisco Bay Area',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T06:43:59.824+00:00',
  'new',
  85,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Job: Enterprise Solutions Engineer- WEST at Hightouch
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  'ae6a11d6-143f-48da-9974-a3d67988feb6',
  'https://www.linkedin.com/jobs/view/4224812321',
  'Enterprise Solutions Engineer- WEST',
  'Hightouch',
  '**About the job** About Hightouch Hightouch’s mission is to empower everyone to take action on their data. Hundreds of companies, including Autotrader, Calendly, Cars.com, Monday.com, and PetSmart, trust Hightouch to power their growth. We pioneered the Composable Customer Data Platform (CDP), which lets companies use their own data warehouse to collect, prepare, and activate customer data for marketing personalization and business operations. Our new AI Decisioning platform goes a step further, allowing marketers to set goals and guardrails that AI agents can then use to personalize 1:1 customer interactions. Traditionally, only technical teams had the skills to access and use customer data. With Hightouch, every business user can deliver personalized customer experiences, optimize performance marketing, and move faster by leveraging data and AI across their organization. Our team focuses on making a meaningful impact for our customers. We approach challenges with a first-principles mindset, move quickly and efficiently, and treat each other with compassion and kindness. We look for team members who are strong communicators, have a growth mindset, and are motivated and persistent in achieving our goals. What else? We’re based in San Francisco but have team members all over the world. Our Series C put us at a $1.2B valuation, and we are backed by leading investors such as Sapphire Ventures, Amplify Partners, ICONIQ Growth, Bain Capital Ventures, Y-Combinator, and Afore Capital. About The Role Have you got a knack for explaining technical concepts? Do you want to work closely with big-name companies to solve some of their toughest problems? We’re looking for an Enterprise Solutions Engineer who loves teaching people, solving problems, and wants to be a major factor in adding to the list of our biggest customers. You’d be joining a team of talented solutions engineers that love going deep into customer’s problems, finding ways to innovate in the ways customers use data, and making life easier for people. We care deeply about our users and partners, and we judge ourselves on how well we serve them. We partner with our Account Executives by removing technical and business-related obstacles in front of a sale, advocating for customer interests to relevant internal teams, and creating compelling technical content. We get excited talking to data engineers, product managers, marketers, and also know how to distill technical concepts to our buyers. We’re here to make our customers’ lives easier by providing them with the right solutions for their challenges in customer data strategy and architecture. Solutions Engingeers at Hightouch frequently work with both technical and non-technical stakeholders to understand their problems and craft creative technical solutions with them. We’re open to candidates with a variety of backgrounds. What We''re Looking For • 4+ years sales experience with at least 2+ years of that being into enterprise companies • Strong discovery and interpersonal skills • Intellectual curiosity, high ambition and humility • Experience selling Martech and/or Data Solutions • Experience with the following: Cloud Warehouses, Data Engineering, Data Analytics, and Data Modeling, and API''s Bonus If You Have • Experience with Customer Data Platforms The salary range for this position is 190,000-220,000 OTE (70/30 split) per year, which is location independent in accordance with our remote-first policy. We also offer meaningful equity compensation in the form of ISO options, and offer early exercise and a 10 year post-termination exercise window.',
  'San Francisco Bay Area',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T06:51:16.748+00:00',
  'new',
  85,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Job: Mid-Level Pre-Sales Engineer (Remote) at Jobright.ai
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  '14f23924-0b96-43e4-9c39-31ef14ad8456',
  'https://www.linkedin.com/jobs/view/4274391879',
  'Mid-Level Pre-Sales Engineer (Remote)',
  'Jobright.ai',
  '**About the job** Verified Job On Employer Career Site Job Summary:GrowthLoop is a pioneer in AI-powered marketing on the data cloud, helping innovative companies transform their marketing strategies. As a Pre-Sales Engineer, you''ll collaborate closely with the sales team to demonstrate the value of GrowthLoop''s Compound Marketing Engine to prospective clients, serving as the technical authority and bridging the gap between product and customer. Responsibilities:• Partner with Sales: Collaborate closely with Account Executives throughout the full sales cycle - qualifying opportunities, strategizing outreach, and delivering tailored product insights that close deals.• Be the Technical Authority: Serve as the primary technical point of contact for prospective customers, ensuring clarity, confidence, and trust during every interaction.• Tailor Solutions to Needs: Understand each customer''s business challenges and data maturity. Craft customized demonstrations and solution paths using GrowthLoop''s suite to address their specific use cases.• Showcase Product Value: Deliver compelling product demos, prototypes, and proof-of-value sessions. Articulate GrowthLoop''s differentiators in a competitive and evolving CDP and martech landscape.• Stay Ahead of the Curve: Keep a pulse on industry trends, competitive offerings, and new use cases - especially around AI for marketing and data, composable CDPs, data warehouses, identity resolution, and cross-channel activation.• Feedback Loop: Capture prospect feedback and frontline learnings. Inform the product team of customer pain points, edge cases, and unmet needs that can shape our roadmap.• Lead with Initiative: Embrace ownership: flag and fix bugs when you can, unblock bottlenecks, and proactively drive clarity and progress. Our team values those who spot friction and take action.• Travel: Support key sales opportunities in-person when strategic and impactful to do so. Qualifications: Required:• 3+ years in a sales engineering or technical pre-sales role, ideally at a martech SaaS company with a complex sales cycle.• Familiarity with cloud data platforms (e.g., Snowflake, BigQuery), common LLMs, and modern data stack technologies.• Experience in or strong understanding of marketing operations, customer segmentation, and campaign execution workflows.• Proven ability to translate technical capabilities into business value, engaging both technical and non-technical stakeholders.• Strong communication, storytelling, and persuasion skills.• Comfort with pricing discussions, deal structuring, and supporting the sales process end-to-end.• Detail-oriented with excellent organizational and documentation skills.• Collaborative and proactive mindset—comfortable navigating ambiguity and a fast-moving startup environment.• A passion for enabling customers and solving real-world marketing challenges with data. Preferred:• Prior experience in Marketing, Marketing Ops, or Marketing Strategy is a plus. Company:GrowthLoop is a Compound Marketing Engine that drives compound growth by accelerating the marketing cycle, using Agentic AI powered by your enterprise cloud data. Founded in 2015, the company is headquartered in San Francisco, CA, US, with a team of 51-200 employees. The company is currently Growth Stage.',
  'United States',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T06:46:12.496+00:00',
  'new',
  75,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Job: Senior Sales Engineer, Strategic at Motive
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  '441045bc-78df-4731-898e-25f64880a50e',
  'https://www.linkedin.com/jobs/view/4174921278',
  'Senior Sales Engineer, Strategic',
  'Motive',
  '**About the job** Who We Are Motive empowers the people who run physical operations with tools to make their work safer, more productive, and more profitable. For the first time ever, safety, operations and finance teams can manage their drivers, vehicles, equipment, and fleet related spend in a single system. Combined with industry leading AI, the Motive platform gives you complete visibility and control, and significantly reduces manual workloads by automating and simplifying tasks. Motive serves more than 100,000 customers – from Fortune 500 enterprises to small businesses – across a wide range of industries, including transportation and logistics, construction, energy, field service, manufacturing, agriculture, food and beverage, retail, and the public sector. Visit gomotive.com to learn more. About The Role As a Senior Sales Engineer on our Strategic team, you will have the opportunity to play an active part in increasing effectiveness, productivity, and revenue growth in the Sales Team. The Senior Sales Engineer will report directly into a Manager of Strategic Sales Engineering and will be expected to have excellent interpersonal communication skills, technical comprehension, product expertise, business acumen, and overall industry knowledge. What You''ll Do • Partner and strategize with Strategic Account Executives for discovery calls, product demonstrations, POC support and onsite meetings • Will be capable of providing customized demonstrations of the Motive product offering to prospects spanning a multitude of roles • Successfully match customer pains and requirements to proposed solutions • Become an expert on Motive’s competition, lending your expertise to Strategic AEs working on displacement deals • Product expert, not only on Motive’s current offering but our roadmap as well • Work with Enterprise AEs to respond to RFIs and RFPs • Sales liaison between multiple internal organizations, including; Product, Engineering, Customer Success and Product Marketing What We''re Looking For • Minimum 5+ years working with Strategic-level sales prospects in a pre-sales/sales engineering capacity (SaaS and Hardware experience is a plus) • Bachelor''s Degree required, Bachelor’s of Science preferred, MS a plus • Ability to travel ~30% • Excellent communication skills • Proven analytical and problem-solving skills • Consistent track record selling complex solutions • Experience with Strategic Enterprise sales cycles • Experience in the Transportation & Logistics industry is a plus • Experience with APIs and integrations Pay Transparency Your compensation may be based on several factors, including education, work experience, and certifications. For certain roles, total compensation may include restricted stock units. Motive offers benefits including health, pharmacy, optical and dental care benefits, paid time off, sick time off, short term and long term disability coverage, life insurance as well as 401k contribution (all benefits are subject to eligibility requirements). Learn more about our benefits by visiting Motive Perks & Benefits. The on-target earnings (base pay + commissions) for this role: $180,000—$240,000 USD Creating a diverse and inclusive workplace is one of Motive''s core values. We are an equal opportunity employer and welcome people of different backgrounds, experiences, abilities and perspectives. Please review our Candidate Privacy Notice here . UK Candidate Privacy Notice here. The applicant must be authorized to receive and access those commodities and technologies controlled under U.S. Export Administration Regulations. It is Motive''s policy to require that employees be authorized to receive access to Motive products and technology.',
  'United States',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T06:41:50.751+00:00',
  'new',
  75,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Job: Senior Sales Engineer, West at Recorded Future
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  'bafd5f42-ffe0-4e50-bfa8-f744208f8aa4',
  'https://www.linkedin.com/jobs/view/4208818377',
  'Senior Sales Engineer, West',
  'Recorded Future',
  '**About the job** With 1,000 intelligence professionals, over $300M in sales, and serving over 1,900 clients worldwide, Recorded Future is the world’s most advanced, and largest, intelligence company! As a Sr. Sales Engineer, you’ll partner closely with our West region account teams to support enterprise customers and prospects in addressing their most pressing cybersecurity challenges. In this role, you’ll lead complex pilot engagements and guide the transition to successful onboarding of tailored solutions—ensuring strong outcomes and long-term customer success. The position requires a blend of cybersecurity expertise, technical engineering skills, analytical thinking, and strategic business acumen. What you''ll do as a Senior Sales Engineer: • Be a content creator, not just a consumer—drive the creation of new ideas, presentations, and technical approaches • Engage directly with prospective clients to understand requirements, field technical questions, and deliver compelling product demos • Plan and execute product proof of value (POV) engagements • Develop and deliver sample use cases and analytical demo scenarios • Document and maintain the technical sales process, ensuring clarity and consistency across the team • Triage and resolve key analytical, technical, and operational challenges • Drive user adoption across diverse use cases and customer environments • Lead interactive, technical workshops to showcase product value What you''ll bring to the Senior Sales Engineer role: • Ability to lead both technical and sales calls independently within 45–60 days • Minimum 5 years'' experience as a Sales Engineer or Intelligence Analyst/Officer • Proven track record of success in a pre-sales role at a cybersecurity or threat intelligence organization • Deep expertise in cybersecurity or threat intelligence, with hands-on or operational experience in at least one of the following areas: • SOC/SIEM • Vulnerability Management • Incident Response / Red Team • Threat Hunting / Threat Research • OSINT or All-Source Intelligence • Cyber Threat Intelligence (CTI) • Strong communication and collaboration skills across technical and executive audiences • Willingness to travel up to 30% (non-pandemic conditions) • Relevant certifications (e.g., CISSP, Security+, CISM) preferred but not required The base salary range for this full-time position is $130,000-$200,000. Our salary ranges are determined by role, level, and location. The range displayed reflects the minimum and maximum target for new hire salaries for the position across all US locations. Within the range, individual pay is determined by state, work location and additional factors, including job-related skills, experience, and relevant education or training. This position may be eligible for incentive compensation, equity, and medical, dental, vision, life insurance and 401K. Your recruiter can share more about the specific details of the compensation and benefit package during the hiring process. Why should you join Recorded Future? Recorded Future employees (or “Futurists”), represent over 40 nationalities and embody our core values of having high standards, practicing inclusion, and acting ethically. Our dedication to empowering clients with intelligence to disrupt adversaries has earned us a 4.8-star user rating from Gartner and more than 45 of the Fortune 100 companies as clients. Want more info? Blog & Podcast: Learn everything you want to know (and maybe some things you’d rather not know) about the world of cyber threat intelligence Linkedin, Instagram & Twitter: What’s happening at Recorded Future The Record: The Record is a cybersecurity news publication that explores the untold stories in this rapidly changing field Timeline: History of Recorded Future Recognition: Check out our awards and announcements We are committed to maintaining an environment that attracts and retains talent from a diverse range of experiences, backgrounds and lifestyles. By ensuring all feel included and respected for being unique and bringing their whole selves to work, Recorded Future is made a better place every day. If you need any accommodation or special assistance to navigate our website or to complete your application, please send an e-mail with your request to our recruiting team at careers@recordedfuture.com Recorded Future is an equal opportunity and affirmative action employer and we encourage candidates from all backgrounds to apply. Recorded Future does not discriminate based on race, religion, color, national origin, gender including pregnancy, sexual orientation, gender identity, age, marital status, veteran status, disability or any other characteristic protected by law. Recorded Future will not discharge, discipline or in any other manner discriminate against any employee or applicant for employment because such employee or applicant has inquired about, discussed, or disclosed the compensation of the employee or applicant or another employee or applicant. Recorded Future does not administer a lie detector test as a condition of employment or continued employment. This is in compliance with the law of the Commonwealth of Massachusetts, and in alignment with our hiring practices across all jurisdictions. Notice to Agency and Search Firm Representatives: Recorded Future will not accept unsolicited resumes from any source other than directly from a candidate. Any unsolicited resumes sent to Recorded Future, including those sent to our employees or through our website, will become the property of Recorded Future. Recorded Future will not be liable for any fees related to unsolicited resumes. Agencies must have a valid written agreement in place with Recorded Future''s recruitment team and must receive written authorization before submitting resumes. Submissions made without such agreements and authorization will not be accepted and no fees will be paid.',
  'Los Angeles, CA',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T06:42:41.08+00:00',
  'new',
  75,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Job: Senior Sales Engineer - (West Coast) at Sophos
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  '8b652daa-5321-42f1-ab3d-8e6241d3636e',
  'https://www.linkedin.com/jobs/view/4264744524',
  'Senior Sales Engineer - (West Coast)',
  'Sophos',
  '**About the job** About UsSophos is a global leader and innovator of advanced security solutions for defeating cyberattacks. The company acquired Secureworks in February 2025, bringing together two pioneers that have redefined the cybersecurity industry with their innovative, native AI-optimized services, technologies and products. Sophos is now the largest pure-play Managed Detection and Response (MDR) provider, supporting more than 28,000 organizations. In addition to MDR and other services, Sophos’ complete portfolio includes industry-leading endpoint, network, email, and cloud security that interoperate and adapt to defend through the Sophos Central platform. Secureworks provides the innovative, market-leading Taegis XDR/MDR, identity threat detection and response (ITDR), next-gen SIEM capabilities, managed risk, and a comprehensive set of advisory services. Sophos sells all these solutions through reseller partners, Managed Service Providers (MSPs) and Managed Security Service Providers (MSSPs) worldwide, defending more than 600,000 organizations worldwide from phishing, ransomware, data theft, other every day and state-sponsored cybercrimes. The solutions are powered by historical and real-time threat intelligence from Sophos X-Ops and the newly added Counter Threat Unit (CTU). Sophos is headquartered in Oxford, U.K. More information is available at www.sophos.com. Role SummaryThe Sales Engineer will be responsible for providing deep subject matter expertise on advisory services remotely and in person, scoping and closing incident response engagements, and growing the managed services & integrations business. This role involves collaboration with Sophos Sales, Sales Engineers, Channel Partners, insurance carriers, brokers, and law firms, with a focus on new logo customers. Location: Pacific/Mountain Time Zones - Working remotely What You Will Do • Serve as a subject matter expert on Sophos services, supporting the sales organization and driving new customer acquisitions. • Provide pre-sales support and scope advisory services engagements through remote and onsite interactions with account teams, partners, and customers. • Demonstrate service value through trials, proof of concepts, demonstrations, and enablement activities for partners, resellers, MSPs, and customers, in person and remote. • Collaborate with Channel and Marketing teams to position advisory services, participate in public relations/marketing events, and lead generation campaigns. • Present current cyber threat landscapes and trends to position services for various security assessments and exercises. • Offer light weekend and holiday availability for on-call rotations supporting Digital Forensics and Incident Response services. • Consult, architect, deploy, configure, and troubleshoot solutions within customer environments, ensuring technical requirements are met. • Conduct research on competitive differentiators and maintain a comprehensive knowledge base of the Sophos services portfolio What You Will Bring • Required: Minimum of 5 years of experience in presales support, solutions architecture, consulting, and supporting cybersecurity solutions (e.g., EDR/XDR/DFIR tools, Managed Detection and Response Services). • Desired: Experience in Incident Response (IR) and IR Management. • Desired: Knowledge or expertise in domains such as Digital Forensics, Incident Response, Business Email Compromise, and Compromise Assessment. • Desired: Experience in SecOps, SOC, or as an Analyst. • Desired: Experience working with insurance carriers, brokers, and legal counsels. • Preferred: Experience in Identity Access Management, Multi-Factor Authentication, and deployment of Firewalls, Network Appliances, API Configurations, and SIEM ingestion. • Preferred: Experience in Penetration Testing, Red Teaming, Physical Security, Social Engineering, Insider Threat, Cyber Threat Intelligence, and Threat Hunting • Ability to apply empathy, build trust, and establish rapport with various stakeholders, including customers, partners, insurance carriers, and legal counsels. • Self-motivated and able to thrive in a team environment. • Deep technical knowledge of digital forensics, incident response, endpoint security, networking concepts, and business-critical assets. • Understanding of Threat Actor TTPs, malware, threat hunting, and industry-standard security frameworks (e.g., MITRE). • Knowledge of the security services industry, including competitors, market needs, and trends. In the United States, the base salary for this role ranges from $119,000 to $198,100. In addition to the base salary, there''s a component for target sales commissions alongside a comprehensive benefits package. A candidate’s specific pay within this range will depend on a variety of factors, including job-related skills, training, location, experience, relevant education, certifications, and other business and organizational needs. #B2 Ready to Join Us?At Sophos, we believe in the power of diverse perspectives to fuel innovation. Research shows that candidates sometimes hesitate to apply if they don''t check every box in a job description. We challenge that notion. Your unique experiences and skills might be exactly what we need to enhance our team. Don''t let a checklist hold you back – we encourage you to apply. What''s Great About Sophos?· Sophos operates a remote-first working model, making remote work the primary option for most employees. However, some roles may necessitate a hybrid approach. Please refer to the location details in our job postings for further information.· Our people – we innovate and create, all of which are accompanied by a great sense of fun and team spirit· Employee-led diversity and inclusion networks that build community and provide education and advocacy· Annual charity and fundraising initiatives and volunteer days for employees to support local communities· Global employee sustainability initiatives to reduce our environmental footprint· Global fitness and trivia competitions to keep our bodies and minds sharp· Global wellbeing days for employees to relax and recharge · Monthly wellbeing webinars and training to support employee health and wellbeing Our Commitment To YouWe’re proud of the diverse and inclusive environment we have at Sophos, and we’re committed to ensuring equality of opportunity. We believe that diversity, combined with excellence, builds a better Sophos, so we encourage applicants who can contribute to the diversity of our team. All applicants will be treated in a fair and equal manner and in accordance with the law regardless of gender, sex, gender reassignment, marital status, race, religion or belief, color, age, military veteran status, disability, pregnancy, maternity or sexual orientation. We want to give you every opportunity to show us your best self, so if there are any adjustments we could make to the recruitment and selection process to support you, please let us know. Data ProtectionIf you choose to explore an opportunity, and subsequently share your CV or other personal details with Sophos, these details will be held by Sophos for 12 months in accordance with our Privacy Policy and used by our recruitment team to contact you regarding this or other relevant opportunities at Sophos. If you would like Sophos to delete or update your details at any time, please follow the steps set out in the Privacy Policy describing your individual rights. For more information on Sophos’ data protection practices, please consult our Privacy Policy Cybersecurity as a Service Delivered | Sophos',
  'United States',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T06:43:17.359+00:00',
  'new',
  85,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Job: Head of Product Marketing at Vercel
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  'a038a520-6c0f-4cc9-b487-4fa3293157de',
  'https://www.linkedin.com/jobs/view/4275010655',
  'Head of Product Marketing',
  'Vercel',
  '**About the job** About Vercel: Vercel gives developers the tools and cloud infrastructure to build, scale, and secure a faster, more personalized web. As the team behind v0, Next.js, and AI SDK, Vercel helps customers like Ramp, Supreme, PayPal, and Under Armour build for the AI-native web. Our mission is to enable the world to ship the best products. That starts with creating a place where everyone can do their best work. Whether you''re building on our platform, supporting our customers, or shaping our story: You can just ship things. About the Role: We are seeking an exceptional Head of Product Marketing to join our team at Vercel. This hands-on leadership role requires a deep understanding of frontend and backend technologies, particularly Next.js, Vercel''s platform, v0, the AI SDK, Shadcn, and Turbo.dev. The ideal candidate will be a strategic thinker with strong technical chops, capable of crafting compelling narratives that resonate with developers and enterprise decision-makers alike. As our Head of Product Marketing, you''ll play a crucial role in driving our upmarket strategy, targeting large-scale, global enterprises. We''re looking for a dynamic leader with "LFG" energy—someone who can inspire, innovate, and deliver results while mentoring and elevating our team. What You Will Do: • Develop and execute comprehensive product marketing strategies for Vercel''s suite of products, including Next.js, the Vercel platform, v0, the AI SDK, and Turbo.dev . • Create compelling product positioning and messaging that differentiates Vercel in the market, resonating with both developers and enterprise decision-makers. • Lead go-to-market strategies for new product launches and major updates, ensuring maximum impact and adoption across target segments. • Collaborate closely with the Product team to translate technical features into clear value propositions and benefits for customers. • Conduct in-depth market research and competitive analysis to inform product positioning, identify market opportunities, and guide product development priorities. • Develop and maintain detailed ideal customer profiles (ICPs) and buyer personas for Vercel''s products, with a focus on enterprise customers. • Create and oversee the production of high-quality product marketing collateral, including product sheets, case studies, whitepapers, and sales enablement materials that highlight Vercel''s technical advantages and business value. • Work closely with the Sales team to develop tailored pitch decks, ROI calculators, and other materials that support Enterprise Sales efforts and drive adoption of Vercel''s platform among large organizations. • Lead the development of product-focused content for Vercel''s website, blog, and developer documentation, ensuring clarity and consistency in how Vercel''s products are presented. • Collaborate with the Events team to plan product-centric sessions and demos for conferences like Next.js Conf and Vercel Ship, showcasing Vercel''s latest innovations to the developer community and enterprise prospects. • Implement and manage a voice of the customer program to gather insights that inform product marketing strategies and help prioritize feature development. • Develop and execute strategies to increase product adoption and usage, including onboarding flows, feature announcements, and user education initiatives. • Stay abreast of industry trends, particularly in areas like AI-powered development, edge computing, and enterprise web development, to inform product positioning and identify new market opportunities for Vercel''s offerings. About You: • Deep understanding of the developer ecosystem and the frontend development landscape. • Strong experience in product marketing for technical products—ideally someone from a cloud-native company. • Passion for Next.js and a deep understanding of the Vercel platform and its value proposition. • 8+ years of experience in B2B SaaS marketing, with a proven track record of success in leading and scaling high-performing teams. • Exceptional leadership, communication, and interpersonal skills, with the ability to inspire and motivate teams. • Brand taste is an absolute must. • Excellent project management skills, with the ability to manage multiple projects simultaneously and meet deadlines. • User of X or Bluesky. You must be where your audience is. Benefits: • Great compensation package and stock options. • Inclusive Healthcare Package. • Learn and Grow - we provide mentorship and send you to events that help you build your network and skills. • Flexible Time Off - Flexible vacation policy with a recommended 4-weeks per year, and paid holidays. • Remote Friendly - Work with teammates from different time zones across the globe. • We will provide you the gear you need to do your role, and a WFH budget for you to outfit your space as needed. Vercel is committed to fostering and empowering an inclusive community within our organization. We do not discriminate on the basis of race, religion, color, gender expression or identity, sexual orientation, national origin, citizenship, age, marital status, veteran status, disability status, or any other characteristic protected by law. Vercel encourages everyone to apply for our available positions, even if they don''t necessarily check every box on the job description.',
  'San Francisco Bay Area',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T06:44:36.953+00:00',
  'new',
  40,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Job: Partner Solutions Engineer at Vercel
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  '2d65b95b-cad6-45ec-a800-2f81d8b6c849',
  'https://www.linkedin.com/jobs/view/4241074959',
  'Partner Solutions Engineer',
  'Vercel',
  '**About the job** About Vercel: Vercel gives developers the tools and cloud infrastructure to build, scale, and secure a faster, more personalized web. As the team behind v0, Next.js, and AI SDK, Vercel helps customers like Ramp, Supreme, PayPal, and Under Armour build for the AI-native web. Our mission is to enable the world to ship the best products. That starts with creating a place where everyone can do their best work. Whether you''re building on our platform, supporting our customers, or shaping our story: You can just ship things. About the Role: We are looking for a Senior Partner Solutions Engineer to join our partnerships team. This role will lead technical engagements with solution and product partners, identifying growth opportunities and executing plans that deliver business impact. Partner Solutions Engineers work with partner engineering, sales, and product teams to grow adoption of Vercel''s products and build strong technical relationships. A key focus in this role will be growing Vercel''s enterprise ecommerce partnerships and customer base. Prior experience building and shipping ecommerce applications with Next.js and Vercel is preferred. This role will serve as a developer advocate for Vercel and Next.js across solution and product partners. You will be the expert on integrating partner technology with Vercel products and will establish best practices, author guides, lead workshops, and build solutions for partner communities and Vercel teams. Partner Solution Engineers require a strong web development background, especially in frontend development, cloud infrastructure, networking, and modern application development. Strong coordination skills across multiple partners and time zones are essential, as is building lasting relationships with product champions, users, and executives. If you’re based within a pre-determined commuting distance of one of our offices (SF, NY, London, or Berlin), the role includes in-office anchor days on Monday, Tuesday, and Friday. If you''re located beyond that distance, the role is fully remote. For location-specific details, please connect with our recruiting team. What You Will Do: • Serve as subject matter expert on Vercel and Next.js to strategic partner engineering teams and leadership. • Identify strategic opportunities for technical partnerships and build joint solutions to deliver business outcomes. • Align technical roadmaps, integrations, and ecosystem strategies with partners and Vercel’s teams. • Create and deliver technical training and enablement on Next.js and Vercel best practices. • Support partner engineering teams in building and launching frontend applications on Vercel. • Work alongside sales engineering teams and build templates and prototypes that highlight Vercel with its partners to prospects and customers. • Perform technical audits of Vercel applications to optimize performance and user experience. • Build Next.js templates and solutions that equip partners communities with the best practices on integrating Vercel with partner products. • Present technical workshops and demonstrations at in-person events, conferences, and live webinars. • Champion DevRel initiatives including content creation, training, and community engagement for partners. About You: • You are passionate about building first-class user experiences on the web. • You have a strong understanding of web architecture, frontend development, and serverless computing. • You have 4+ years of experience as a solutions engineer advising or consulting engineering teams. • You have 6+ years of experience building and launching frontend applications using Next.js or React. • You have built and launched digital storefronts that integrated enterprise ecommerce platforms. • You are experienced in developer relations, from training sessions and talks to producing technical content. • You have a results-driven mindset and are experienced working in a fast-paced environment. • You are comfortable working with remote, globally distributed cross-functional teams. • You have excellent communication skills and experience building and maintaining strong relationships with stakeholders. • You have experience driving the adoption of web technology or previous pre-sales experience. • You are able to travel 20% of the time. Benefits: • Competitive compensation package, including equity. • Inclusive Healthcare Package. • Learn and Grow - we provide mentorship and send you to events that help you build your network and skills. • Flexible Time Off. • We will provide you the gear you need to do your role, and a WFH budget for you to outfit your space as needed. The San Francisco, CA OTE pay range for this role is $168,000-$230,000. Actual salary will be based on job-related skills, experience, and location. Compensation outside of San Francisco may be adjusted based on employee location, and the total package includes benefits and equity-based compensation. Your recruiter can share more details during the hiring process. Vercel is committed to fostering and empowering an inclusive community within our organization. We do not discriminate on the basis of race, religion, color, gender expression or identity, sexual orientation, national origin, citizenship, age, marital status, veteran status, disability status, or any other characteristic protected by law. Vercel encourages everyone to apply for our available positions, even if they don''t necessarily check every box on the job description.',
  'United States',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T06:45:24.321+00:00',
  'new',
  85,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Job: Solutions Engineer at Whip Media
INSERT INTO jobs (
  id, url, title, company, description, location, employment_type,
  experience_level, salary, posted_date, applicant_count, skills,
  source, scraped_at, status, ai_fit_score, owner_type, owner_uid
) VALUES (
  'fe28574e-b8f6-4fb6-b27d-d4b9a1baf2f7',
  'https://www.linkedin.com/jobs/view/4278645741',
  'Solutions Engineer',
  'Whip Media',
  '**About the job** Whip Media is the leading SaaS platform transforming how the world’s largest media and entertainment companies manage, distribute, and monetize content across the global streaming supply chain. Our flagship product, Helix, is an AI-native platform built to radically optimize content operations—empowering data-driven decisions that maximize revenue, streamline distribution, and scale profitable strategies. Trusted by top studios, networks, and streaming platforms, we’re redefining the business of content through innovation, collaboration, and a culture that values impact just as much as fun. If you’re ready to shape the future of entertainment at the intersection of media and technology, join us. The Job: Whip Media is seeking a highly motivated and technically proficient Solutions Engineer to join our dynamic team. In this pivotal role, you will be the technical anchor throughout the customer journey, from initial engagement through successful implementation and ongoing adoption. You will leverage your deep understanding of our platform and the media & entertainment industry to translate complex client needs into compelling technical solutions, ensuring our customers maximize the value they derive from Whip Media''s cutting-edge products.This role is distinct from our internal Product team''s Solution Architect role, focusing on the customer-facing technical sales and post-sales enablement. What You''ll Do: Presales & Technical Discovery: • Technical Demonstrations: Deliver compelling, tailored product demonstrations of Whip Media''s platform to prospective clients, showcasing key features and workflows relevant to their specific business challenges. • Discovery & Qualification: Conduct in-depth technical discovery sessions with prospects to understand their current state, pain points, technical environment, data structures, and desired future state. • Solution Scoping: Collaborate with the Sales team to define and scope technical solutions that address identified client needs, outlining system integrations, data migration strategies, and potential customization requirements. • Technical Point of Contact: Act as the primary technical point of contact for prospects during the sales cycle, addressing technical questions, security inquiries, and infrastructure considerations. • RFP/RFI Support: Provide technical expertise and contribute content to responses for RFPs (Request for Proposals) and RFIs (Request for Information). Solution Design & Strategy: • Architecture Review (External Focus): Work with customer technical teams to align Whip Media''s proposed solution with their existing architecture and technical requirements. • Proof-of-Concept (POC) / Pilot Support: Lead or support technical aspects of POCs and pilot programs, ensuring successful evaluation and validation of the solution. • Feedback Loop: Capture and relay customer feedback, market trends, and technical requirements to internal Product and Engineering teams to inform future product development. Post-Sales Implementation & Enablement: • Technical Onboarding & Configuration: Assist customers with initial technical onboarding, platform configuration, and data integration activities post-sale, ensuring a smooth transition. • Technical Training: Develop and deliver technical training sessions to customer teams (e.g., IT, operations, data teams) on platform usage, APIs, data ingestion, and best practices. • Technical Advisory: Provide ongoing technical guidance and best practices to customers during their initial adoption phase. • Troubleshooting Support: Serve as an escalation point for complex technical issues during initial implementation, working closely with Customer Success and Support teams to drive resolution. What You''ll Bring: • 5+ years of experience in a customer-facing technical role such as Solutions Engineer, Sales Engineer, Technical Consultant, or similar, preferably within a SaaS company. • Proven experience delivering compelling technical product demonstrations to diverse audiences, including technical and non-technical stakeholders. • Strong understanding of API integrations (REST, SOAP), data formats (XML, JSON), and data integration methodologies. • Familiarity with database concepts (SQL, NoSQL) and data migration strategies. • Solid grasp of cloud computing concepts (AWS, Azure, GCP) and SaaS architecture. • Excellent communication, presentation, and interpersonal skills, with the ability to articulate complex technical concepts clearly to both technical and business audiences. • Strong problem-solving and analytical abilities, with a consultative approach to understanding customer challenges. • Ability to work independently and as part of a collaborative team in a fast-paced environment. • Travel may be required (up to 30%) for client meetings, conferences, etc. Bonus Points If You Have: • Direct experience in the Media & Entertainment industry (e.g., content distribution, licensing, rights management, broadcast, streaming). • Experience with workflow automation platforms or enterprise content management systems. • Familiarity with CRM (e.g., Salesforce) and project management tools. • A background in software development or scripting (e.g., Python). Education: • Bachelor''s degree in Computer Science, Engineering, Information Systems, or a related technical field, or equivalent practical experience. What We Have to Offer:Your wellbeing is our priority. We want our Whipsters to feel set up for success at work and at home! We offer a competitive health plan so you can choose the right plan for you and your loved ones! We offer wellbeing bundles to ensure your mental and physical health resources are at your fingertips. Whip’s People Team is committed to your happiness and growth in every aspect of your life! Here are some other perks: • Competitive Maternity/paternity leave • Remote office stipend • Flexible PTO • Referral Bonuses • Access to FSA plans • 401K retirement plan • Monthly mobile reimbursement Equal Opportunity Employer:At Whip Media, we are all Whipsters! We strive to create an inclusive, diverse environment where you are encouraged to bring your whole self to work. We value unique perspectives, ideas, authenticity, and welcome, as well as support, points of view which drive your own growth alongside that of the company. Whip Media has made a commitment to continue to grow our diverse workplace and partners with organizations that provide us with a range of candidates from diverse backgrounds. We foster a people-centric environment that promotes and evaluates belonging and inclusion and actively strives to bridge any gaps that exist between employee groups.',
  'Los Angeles, CA',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::text[],
  'linkedin',
  '2025-08-02T03:57:46.793+00:00',
  'new',
  75,
  'demo',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- ====================
-- 3. INSERT JOB ENRICHMENTS (COMPLETE V3 DATA)
-- ====================

-- Enrichment: Senior Sales Engineer - (West Coast) at Sophos
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  '8b652daa-5321-42f1-ab3d-8e6241d3636e',
  'demo_admin',
  'completed',
  85,
  false,
  119000,
  198100,
  'USD',
  'remote',
  '["PoC execution","API integrations","Technical discovery","Consultative selling"]'::jsonb,
  '["Incident Response management","Experience with insurance carriers"]'::jsonb,
  '["EDR","XDR","DFIR","API integrations","Salesforce"]'::jsonb,
  ARRAY[]::text[],
  'Joseph''s expertise in PoC execution and consultative selling aligns well with the responsibilities of the Senior Sales Engineer role, though he may need to bolster his experience in Incident Response and engagement with insurance carriers.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Establish relationships with key stakeholders","required_support":["Introductions from management"],"success_criteria":"Positive feedback from team members and partners","stakeholder_impact":"Sales and Marketing teams"}],"direct_matches":[{"proof_point":"Successfully led multiple PoC projects in previous roles","talking_point":"Experience in executing PoCs effectively","joseph_strength":"PoC execution and ownership","impact_potential":"immediate","role_requirement":"Serve as a subject matter expert on Sophos services"}],"demo_suggestions":[{"demo_concept":"Cybersecurity Threat Landscape Overview","business_value_story":"Demonstrates Sophos'' proactive approach to threat management.","tech_stack_alignment":["EDR","XDR"],"differentiation_factor":"Focus on real-time threat intelligence.","preparation_complexity":"moderate"}],"process_improvements":[{"joseph_solution":"Implement proactive engagement strategies.","improvement_area":"Customer Engagement Process","stakeholder_impact":["Sales Team","Customer Success"],"implementation_effort":"medium term","current_state_assumption":"Engagements are reactive."}],"positioning_strategies":{"risk_mitigation":["Emphasize proven track record in incident response"],"growth_narrative":"Position Sophos as a leader in Managed Detection and Response.","cultural_alignment":["Commitment to diversity and inclusion"],"competitive_advantages":["Strong market presence","Innovative technology"],"unique_value_proposition":"Sophos offers comprehensive cybersecurity solutions powered by AI."}},"correlation_id":"req_885f237e-4857-44a0-ae39-895417e0c1cb","implicit_risks":[{"reason":"Pattern \"on-call rotation\" suggests work life_balance","category":"WORK_LIFE_BALANCE","evidence":[" offer light weekend and holiday availability for on-call rotations supporting digital forensics and incident respon"],"severity":"HIGH","confidence":0.9,"isImplicit":true,"isDealbreaker":false},{"reason":"Pattern \"comprehensive benefits\" suggests compensation","category":"COMPENSATION","evidence":["omponent for target sales commissions alongside a comprehensive benefits package. a candidate’s specific pay within this r"],"severity":"MEDIUM","confidence":0.5,"isImplicit":true,"isDealbreaker":false},{"reason":"Pattern \"proof of concept\" suggests company stability","category":"COMPANY_STABILITY","evidence":["mers. • demonstrate service value through trials, proof of concepts, demonstrations, and enablement activities for p"],"severity":"MEDIUM","confidence":0.6,"isImplicit":true,"isDealbreaker":false}],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":65,"growth_potential_score":50,"work_life_balance_score":40,"overall_recommendation_score":46,"compensation_competitiveness_score":25},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T06:43:57.414Z","interview_intelligence":{"red_flags":[{"severity":"minor","description":"Role may require light weekend and holiday availability.","concern_type":"Travel Requirements","mitigation_strategy":"Clarify travel expectations during interviews."}],"success_factors":{"key_differentiators":["Strong technical knowledge","Ability to build trust with clients"],"cultural_fit_signals":["Team collaboration","Diversity and inclusion focus"],"common_failure_points":["Inability to articulate value proposition"]},"predicted_stages":[{"format":"Video call","stage_name":"Initial Screening","focus_areas":["Technical skills","Cultural fit"],"typical_duration":"30 minutes","interviewer_roles":["HR Recruiter","Hiring Manager"],"preparation_weight":7}],"technical_assessment":{"mock_demo_required":true,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":false,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Technical Skills","specific_topics":["Incident Response","Cybersecurity trends"],"time_allocation":"2 hours","confidence_booster":true}]},"sales_engineering_signals":{"role_composition":{"confidence":0.85,"ae_se_ratio":"1:3","remote_onsite_mix":"remote","travel_percentage":10,"presales_team_size":"medium","demo_poc_percentage":40,"enablement_percentage":10,"architecture_percentage":30,"customer_interaction_percentage":20},"enablement_tooling":{"confidence":0.8,"tool_ownership":{"demo_automation":true,"internal_portals":true,"integration_tools":true,"playbook_creation":true},"content_creation":{"code_samples":true,"video_tutorials":false,"technical_whitepapers":true,"presentation_templates":true},"collaboration_scope":{"rnd_team":true,"product_team":true,"marketing_team":true,"customer_success":true},"training_responsibilities":{"internal_design":true,"internal_delivery":true,"partner_enablement":true,"customer_enablement":true}},"demo_poc_environment":{"confidence":0.8,"demo_count":{"demo_types":["Proof of Concept","Trial"],"built_vs_maintained":"built"},"tech_stack":["EDR","XDR","API integrations"],"demo_tooling":["Salesforce","Custom demo environments"],"poc_characteristics":{"ownership_level":"high","typical_duration":"1-2 weeks","customer_count_avg":5,"success_criteria_defined":true},"complexity_indicators":{"multi_region":false,"data_integration":true,"custom_development":true,"regulatory_requirements":false}},"success_metrics_career":{"confidence":0.85,"kpis_mentioned":["Customer acquisition","Customer satisfaction","Revenue growth"],"success_ownership":{"team_metrics":true,"individual_metrics":true,"revenue_attribution":true},"career_progression":{"growth_signals":true,"promotion_path":["Senior Sales Engineer","Sales Manager"],"leadership_opportunities":true},"technical_expectations":{"soft_skills_emphasis":["Empathy","Communication"],"tech_stack_preferences":["EDR","XDR"],"certification_requirements":["CISSP","CEH"]}},"methodology_deal_context":{"confidence":0.75,"role_in_cycle":["Pre-sales support","Customer engagement","Technical consultation"],"sales_framework":["Solution Selling","Consultative Selling"],"customer_profile":{"target_verticals":["Finance","Healthcare","Government"],"customer_size_focus":"mid to large enterprises","strategic_logos_mentioned":true},"deal_characteristics":{"deal_complexity":"medium","cycle_length_avg":"3-6 months","typical_acv_band":"$100k-$500k"},"competitive_landscape":{"direct_competitors_mentioned":["Palo Alto Networks","CrowdStrike"],"competitive_positioning_focus":true}}}}'::jsonb,
  NULL,
  90,
  'Led successful PoC executions and API integrations, driving customer engagement and satisfaction in technical sales environments.',
  '{"benefits":["Comprehensive benefits package","Remote-first working model","Diversity and inclusion networks","Annual charity initiatives","Global wellbeing days"],"comp_max":198100,"comp_min":119000,"industry":"Cybersecurity","tech_stack":["EDR","XDR","DFIR","API integrations","Salesforce"],"company_size":"large","requirements":["Minimum of 5 years in presales support","Experience in Incident Response","Knowledge in Digital Forensics","Experience with insurance carriers and legal counsels"],"comp_currency":"USD","remote_policy":"remote","skills_sought":[{"type":"experience","level":"5+","skill":"presales support"},{"type":"experience","level":"5+","skill":"solutions architecture"},{"type":"experience","level":"5+","skill":"consulting"},{"type":"experience","level":"5+","skill":"cybersecurity solutions"}],"travel_required":"0-25%","requires_clearance":false,"experience_years_max":null,"experience_years_min":5}'::jsonb,
  0,
  NULL,
  'req_885f237e-4857-44a0-ae39-895417e0c1cb',
  '2025-08-02T06:43:57.414+00:00',
  '2025-08-02T06:43:57.414+00:00',
  'Joseph has strong technical skills and experience in presales support, which aligns well with the requirements for the Senior Sales Engineer role at Sophos.',
  ARRAY['PoC execution and ownership', 'API integrations', 'Technical discovery and consultative selling'],
  ARRAY['Potential for enterprise politics', 'Unclear success criteria in role'],
  ARRAY['Sophos values diverse perspectives and encourages candidates to apply even if they don''t meet every requirement.', 'The role requires light weekend and holiday availability, which may impact work-life balance.'],
  '[{"type":"experience","level":"5+","skill":"presales support"},{"type":"experience","level":"5+","skill":"solutions architecture"},{"type":"experience","level":"5+","skill":"consulting"},{"type":"experience","level":"5+","skill":"cybersecurity solutions"}]'::jsonb,
  '2025-08-02T06:43:57.424692+00:00',
  '2025-08-02T06:43:57.424692+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- Enrichment: Solutions Engineer at Whip Media
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  'fe28574e-b8f6-4fb6-b27d-d4b9a1baf2f7',
  'demo_admin',
  'completed',
  75,
  true,
  NULL,
  NULL,
  'USD',
  NULL,
  '["PoC execution","API integrations","Technical discovery","Salesforce"]'::jsonb,
  '["Data migration strategies","Cloud computing concepts"]'::jsonb,
  '["SaaS","API integrations","Cloud computing (AWS, Azure, GCP)","SQL","NoSQL"]'::jsonb,
  ARRAY[]::text[],
  'Joseph Click is a strong candidate for the Solutions Engineer role at Whip Media, with relevant experience in technical sales and a solid understanding of API integrations. However, the high travel requirement may be a dealbreaker.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Complete onboarding and training","required_support":["Mentorship from senior team members"],"success_criteria":"Demonstrate understanding of the product and customer needs.","stakeholder_impact":"Sales team, Customer Success"}],"direct_matches":[{"proof_point":"Increased client engagement and satisfaction","talking_point":"Led successful PoC initiatives","joseph_strength":"PoC execution","impact_potential":"immediate","role_requirement":"Technical demonstrations"}],"demo_suggestions":[{"demo_concept":"API integration showcase","business_value_story":"Demonstrating seamless integration capabilities to enhance client operations.","tech_stack_alignment":["API integrations","SaaS"],"differentiation_factor":"Focus on real-world use cases.","preparation_complexity":"moderate"}],"process_improvements":[{"joseph_solution":"Develop a structured onboarding program with clear milestones.","improvement_area":"Technical onboarding process","stakeholder_impact":["Customer Success","Sales"],"implementation_effort":"medium term","current_state_assumption":"Current onboarding may lack structure."}],"positioning_strategies":{"risk_mitigation":["Addressing travel concerns upfront"],"growth_narrative":"Positioning as a key player in the evolving media landscape.","cultural_alignment":["Innovation","Collaboration"],"competitive_advantages":["Strong product knowledge","Proven track record in technical sales"],"unique_value_proposition":"Combining technical expertise with a consultative approach."}},"correlation_id":"req_ad4346fa-42d2-45e5-8146-84ce7f1399c2","implicit_risks":[{"reason":"Pattern \"fast-paced environment\" suggests culture mismatch","category":"CULTURE_MISMATCH","evidence":["endently and as part of a collaborative team in a fast-paced environment. • travel may be required (up to 30%) for client "],"severity":"MEDIUM","confidence":0.6,"isImplicit":true,"isDealbreaker":false},{"reason":"Pattern \"pivot\" suggests company stability","category":"COMPANY_STABILITY","evidence":["utions engineer to join our dynamic team. in this pivotal role, you will be the technical anchor througho"],"severity":"HIGH","confidence":0.8,"isImplicit":true,"isDealbreaker":false}],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":40,"growth_potential_score":50,"work_life_balance_score":30,"overall_recommendation_score":44,"compensation_competitiveness_score":50},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T03:58:28.426Z","interview_intelligence":{"red_flags":[{"severity":"major","description":"The role requires 25-50% travel, which exceeds Joseph''s preference.","concern_type":"Travel Requirement","mitigation_strategy":"Discuss potential for reduced travel during the interview."}],"success_factors":{"key_differentiators":["Strong technical knowledge","Effective communication skills"],"cultural_fit_signals":["Emphasis on collaboration and innovation"],"common_failure_points":["Inability to articulate technical concepts"]},"predicted_stages":[{"format":"Video call","stage_name":"Initial Screening","focus_areas":["Technical skills","Cultural fit"],"typical_duration":"30 minutes","interviewer_roles":["HR","Hiring Manager"],"preparation_weight":7}],"technical_assessment":{"mock_demo_required":true,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":false,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Technical Skills","specific_topics":["API integrations","SaaS architecture"],"time_allocation":"2 hours","confidence_booster":true}]},"sales_engineering_signals":{"role_composition":{"confidence":0.8,"ae_se_ratio":null,"remote_onsite_mix":"flexible","travel_percentage":30,"presales_team_size":null,"demo_poc_percentage":50,"enablement_percentage":20,"architecture_percentage":20,"customer_interaction_percentage":30},"enablement_tooling":{"confidence":0.6,"tool_ownership":{"demo_automation":false,"internal_portals":false,"integration_tools":false,"playbook_creation":false},"content_creation":{"code_samples":false,"video_tutorials":false,"technical_whitepapers":false,"presentation_templates":true},"collaboration_scope":{"rnd_team":false,"product_team":true,"marketing_team":false,"customer_success":true},"training_responsibilities":{"internal_design":false,"internal_delivery":true,"partner_enablement":false,"customer_enablement":true}},"demo_poc_environment":{"confidence":0.7,"demo_count":{"demo_types":["Technical demonstrations","Proof-of-Concepts"],"built_vs_maintained":null},"tech_stack":["SaaS","API integrations","Cloud computing"],"demo_tooling":[],"poc_characteristics":{"ownership_level":"high","typical_duration":"2-4 weeks","customer_count_avg":5,"success_criteria_defined":true},"complexity_indicators":{"multi_region":false,"data_integration":true,"custom_development":true,"regulatory_requirements":false}},"success_metrics_career":{"confidence":0.7,"kpis_mentioned":["Customer satisfaction","Successful implementations"],"success_ownership":{"team_metrics":true,"individual_metrics":true,"revenue_attribution":false},"career_progression":{"growth_signals":true,"promotion_path":["Senior Solutions Engineer","Technical Sales Manager"],"leadership_opportunities":true},"technical_expectations":{"soft_skills_emphasis":["Communication","Problem-solving"],"tech_stack_preferences":["SaaS","API integrations"],"certification_requirements":[]}},"methodology_deal_context":{"confidence":0.75,"role_in_cycle":["Technical demonstrations","Customer discovery","Solution scoping"],"sales_framework":["Consultative selling","Solution selling"],"customer_profile":{"target_verticals":["Media","Entertainment"],"customer_size_focus":"large","strategic_logos_mentioned":true},"deal_characteristics":{"deal_complexity":"medium","cycle_length_avg":"3-6 months","typical_acv_band":null},"competitive_landscape":{"direct_competitors_mentioned":[],"competitive_positioning_focus":true}}}}'::jsonb,
  NULL,
  80,
  'Led successful PoC initiatives and technical demonstrations for SaaS solutions, enhancing client engagement and satisfaction.',
  '{"benefits":["Competitive health plan","Flexible PTO","401K retirement plan","Remote office stipend","Maternity/paternity leave"],"comp_max":null,"comp_min":null,"industry":"Media & Entertainment","tech_stack":["SaaS","API integrations","Cloud computing (AWS, Azure, GCP)","SQL","NoSQL"],"company_size":"large","requirements":["5+ years in a customer-facing technical role","Experience delivering technical demonstrations","Strong understanding of API integrations","Familiarity with database concepts","Excellent communication skills"],"comp_currency":"USD","remote_policy":null,"skills_sought":[{"type":"sales","level":"expert","skill":"Technical demonstrations"},{"type":"technical","level":"expert","skill":"API integrations"},{"type":"technical","level":"intermediate","skill":"Data migration strategies"},{"type":"technical","level":"intermediate","skill":"Cloud computing concepts"},{"type":"soft","level":"expert","skill":"Communication skills"},{"type":"soft","level":"expert","skill":"Problem-solving"}],"travel_required":"25-50%","requires_clearance":false,"experience_years_max":null,"experience_years_min":5}'::jsonb,
  0,
  NULL,
  'req_ad4346fa-42d2-45e5-8146-84ce7f1399c2',
  '2025-08-02T03:58:28.426+00:00',
  '2025-08-02T03:58:28.426+00:00',
  'Joseph''s strengths in PoC execution, API integrations, and consultative selling align well with the requirements for technical demonstrations and customer interactions. However, the travel requirement of 25-50% is a concern.',
  ARRAY['PoC execution', 'API integrations', 'Technical discovery', 'Consultative selling'],
  ARRAY['Travel requirement exceeds Joseph''s preference', 'Potential for enterprise politics'],
  ARRAY['Joseph''s experience with Salesforce aligns with the CRM familiarity mentioned in the job posting.', 'The role''s focus on customer-facing technical sales matches Joseph''s strengths in consultative selling.', 'The emphasis on technical training and onboarding aligns with Joseph''s experience in technical discovery.'],
  '[{"type":"sales","level":"expert","skill":"Technical demonstrations"},{"type":"technical","level":"expert","skill":"API integrations"},{"type":"technical","level":"intermediate","skill":"Data migration strategies"},{"type":"technical","level":"intermediate","skill":"Cloud computing concepts"},{"type":"soft","level":"expert","skill":"Communication skills"},{"type":"soft","level":"expert","skill":"Problem-solving"}]'::jsonb,
  '2025-08-02T03:58:28.437187+00:00',
  '2025-08-02T03:58:28.437187+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- Enrichment: Solutions Engineer, NAM at BioCatch
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  'f6af1c17-0794-46ca-921d-7ed32eae330d',
  'demo_admin',
  'completed',
  85,
  false,
  100000,
  130000,
  'USD',
  'remote',
  '["API integrations","Python","SQL"]'::jsonb,
  '["Experience with specific web technologies","Mobile development experience"]'::jsonb,
  '["HTML","CSS","JavaScript","Node.js","React","Angular","PHP","Python","React Native","Swift","Kotlin","Java","Flutter","Ionic","SQL","Splunk","Elastic","Snowflake"]'::jsonb,
  ARRAY[]::text[],
  'Joseph''s strong background in technical sales and solutions engineering positions him well for the Solutions Engineer role at BioCatch, particularly in onboarding and integration. However, he should clarify travel expectations and ensure alignment with his experience in specific technologies.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Complete onboarding of first client","required_support":["Technical team","Sales team"],"success_criteria":"Client successfully integrated and using BioCatch solutions.","stakeholder_impact":"Customer Success, Sales"}],"direct_matches":[{"proof_point":"Successfully led multiple API integration projects in previous roles.","talking_point":"Experience in API integrations for SaaS platforms","joseph_strength":"API integrations","impact_potential":"immediate","role_requirement":"Technical onboarding and implementation"}],"demo_suggestions":[{"demo_concept":"Integration of BioCatch with existing banking systems","business_value_story":"Demonstrating how BioCatch enhances security and user experience.","tech_stack_alignment":["Python","SQL"],"differentiation_factor":"Focus on behavioral biometrics.","preparation_complexity":"moderate"}],"process_improvements":[{"joseph_solution":"Implement streamlined onboarding with clear milestones.","improvement_area":"Customer onboarding process","stakeholder_impact":["Sales","Customer Success"],"implementation_effort":"medium term","current_state_assumption":"Onboarding may be lengthy and complex."}],"positioning_strategies":{"risk_mitigation":["Clear success criteria for projects"],"growth_narrative":"Position BioCatch as a leader in fraud prevention technology.","cultural_alignment":["Mission-driven approach","Focus on innovation"],"competitive_advantages":["Proven technology","Strong client base"],"unique_value_proposition":"BioCatch''s behavioral biometrics provide unmatched fraud prevention."}},"correlation_id":"req_46d26b1c-e145-4d8e-8d69-a9a1796a0518","implicit_risks":[],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":50,"growth_potential_score":50,"work_life_balance_score":60,"overall_recommendation_score":46,"compensation_competitiveness_score":25},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T06:41:49.571Z","interview_intelligence":{"red_flags":[{"severity":"major","description":"Role may involve more travel than Joseph is comfortable with.","concern_type":"Travel Expectations","mitigation_strategy":"Clarify travel requirements during the interview."}],"success_factors":{"key_differentiators":["Strong technical background","Customer engagement skills"],"cultural_fit_signals":["Mission-driven team environment"],"common_failure_points":["Lack of clear success criteria"]},"predicted_stages":[{"format":"Phone interview","stage_name":"Initial Screening","focus_areas":["Technical skills","Cultural fit"],"typical_duration":"1 week","interviewer_roles":["HR","Hiring Manager"],"preparation_weight":7}],"technical_assessment":{"mock_demo_required":true,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":false,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Technical Skills","specific_topics":["API integrations","SaaS platforms"],"time_allocation":"3 hours","confidence_booster":true}]},"sales_engineering_signals":{"role_composition":{"confidence":0.85,"ae_se_ratio":"1:3","remote_onsite_mix":"remote","travel_percentage":10,"presales_team_size":"medium","demo_poc_percentage":40,"enablement_percentage":10,"architecture_percentage":20,"customer_interaction_percentage":30},"enablement_tooling":{"confidence":0.7,"tool_ownership":{"demo_automation":false,"internal_portals":true,"integration_tools":true,"playbook_creation":true},"content_creation":{"code_samples":true,"video_tutorials":false,"technical_whitepapers":true,"presentation_templates":true},"collaboration_scope":{"rnd_team":true,"product_team":true,"marketing_team":false,"customer_success":true},"training_responsibilities":{"internal_design":true,"internal_delivery":false,"partner_enablement":false,"customer_enablement":true}},"demo_poc_environment":{"confidence":0.8,"demo_count":{"demo_types":["Technical workshops","Integration demonstrations"],"built_vs_maintained":"built"},"tech_stack":["HTML","CSS","JavaScript","Python"],"demo_tooling":["Custom-built demos"],"poc_characteristics":{"ownership_level":"high","typical_duration":"2-4 weeks","customer_count_avg":5,"success_criteria_defined":true},"complexity_indicators":{"multi_region":false,"data_integration":true,"custom_development":true,"regulatory_requirements":true}},"success_metrics_career":{"confidence":0.8,"kpis_mentioned":["Customer satisfaction","Project delivery timelines"],"success_ownership":{"team_metrics":false,"individual_metrics":true,"revenue_attribution":false},"career_progression":{"growth_signals":true,"promotion_path":["Senior Solutions Engineer","Technical Sales Manager"],"leadership_opportunities":true},"technical_expectations":{"soft_skills_emphasis":["Communication","Collaboration"],"tech_stack_preferences":["Python","SQL"],"certification_requirements":[]}},"methodology_deal_context":{"confidence":0.75,"role_in_cycle":["Technical onboarding","Customer workshops"],"sales_framework":["Consultative Selling","Solution Selling"],"customer_profile":{"target_verticals":["Financial Services","Banking"],"customer_size_focus":"large","strategic_logos_mentioned":true},"deal_characteristics":{"deal_complexity":"moderate","cycle_length_avg":"3-6 months","typical_acv_band":"$100k-$500k"},"competitive_landscape":{"direct_competitors_mentioned":["ThreatMetrix","BehavioSec"],"competitive_positioning_focus":true}}}}'::jsonb,
  NULL,
  90,
  'Led successful PoC executions and API integrations for SaaS platforms, enhancing customer satisfaction and driving sales.',
  '{"benefits":["Remote work","Occasional travel opportunities"],"comp_max":130000,"comp_min":100000,"industry":"Financial Technology","tech_stack":["HTML","CSS","JavaScript","Node.js","React","Angular","PHP","Python","React Native","Swift","Kotlin","Java","Flutter","Ionic","SQL","Splunk","Elastic","Snowflake"],"company_size":"large","requirements":["3+ years in Solutions Engineering","Strong project management skills","Proven customer-facing experience","Self-starter with problem-solving abilities","Analytical mindset"],"comp_currency":"USD","remote_policy":"remote","skills_sought":[{"type":"experience","level":"3+","skill":"Solutions Engineering"},{"type":"experience","level":"strong","skill":"Project Management"},{"type":"experience","level":"proven","skill":"Customer-facing Communication"},{"type":"experience","level":"strong","skill":"Technical Troubleshooting"},{"type":"experience","level":"strong","skill":"Analytical Mindset"}],"travel_required":"0-25%","requires_clearance":false,"experience_years_max":null,"experience_years_min":3}'::jsonb,
  0,
  NULL,
  'req_46d26b1c-e145-4d8e-8d69-a9a1796a0518',
  '2025-08-02T06:41:49.571+00:00',
  '2025-08-02T06:41:49.571+00:00',
  'Joseph''s experience in PoC execution, API integrations, and consultative selling aligns well with the role''s requirements for technical onboarding and customer interaction. However, the role''s emphasis on project management and potential travel may be a concern.',
  ARRAY['PoC execution', 'API integrations', 'Technical discovery', 'Consultative selling'],
  ARRAY['Potential for enterprise politics', 'Travel expectations may exceed comfort level'],
  ARRAY['The role offers a strong alignment with Joseph''s technical skills in API integrations and Python.', 'The low travel requirement (up to 10%) is favorable compared to Joseph''s red flag for heavy travel.', 'The company''s focus on financial institutions aligns with Joseph''s experience in consultative selling.'],
  '[{"type":"experience","level":"3+","skill":"Solutions Engineering"},{"type":"experience","level":"strong","skill":"Project Management"},{"type":"experience","level":"proven","skill":"Customer-facing Communication"},{"type":"experience","level":"strong","skill":"Technical Troubleshooting"},{"type":"experience","level":"strong","skill":"Analytical Mindset"}]'::jsonb,
  '2025-08-02T06:41:49.583291+00:00',
  '2025-08-02T06:41:49.583291+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- Enrichment: Senior Sales Engineer, Strategic at Motive
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  '441045bc-78df-4731-898e-25f64880a50e',
  'demo_admin',
  'completed',
  75,
  true,
  180000,
  240000,
  'USD',
  NULL,
  '["PoC execution","API integrations","Technical discovery","Consultative selling"]'::jsonb,
  '["Experience in Transportation & Logistics industry"]'::jsonb,
  '["API","Python","SQL","Salesforce"]'::jsonb,
  ARRAY[]::text[],
  'Joseph has strong technical and consultative skills that align with the Senior Sales Engineer role at Motive, but the travel requirement may be a dealbreaker.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Understand customer pain points","required_support":["Sales Team","Customer Success Team"],"success_criteria":"Identify top 3 customer challenges.","stakeholder_impact":"Sales Team"}],"direct_matches":[{"proof_point":"Led multiple PoC initiatives resulting in increased customer engagement.","talking_point":"Proven track record in executing successful PoCs.","joseph_strength":"PoC execution","impact_potential":"immediate","role_requirement":"Customized demonstrations"}],"demo_suggestions":[{"demo_concept":"API Integration Showcase","business_value_story":"Demonstrating seamless integration capabilities can address customer pain points.","tech_stack_alignment":["API","Python"],"differentiation_factor":"Unique integration capabilities compared to competitors.","preparation_complexity":"moderate"}],"process_improvements":[{"joseph_solution":"Create tailored demos based on customer needs.","improvement_area":"Demo Preparation","stakeholder_impact":["Sales Team","Marketing Team"],"implementation_effort":"quick win","current_state_assumption":"Current demos are generic."}],"positioning_strategies":{"risk_mitigation":["Address potential customer concerns early in the sales process."],"growth_narrative":"Expanding into new verticals with tailored solutions.","cultural_alignment":["Commitment to diversity and inclusion"],"competitive_advantages":["Industry-leading AI","Single system for multiple functions"],"unique_value_proposition":"Motive''s comprehensive platform simplifies fleet management."}},"correlation_id":"req_d6d41f02-5ec6-438d-845e-136024fb39c3","implicit_risks":[],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":50,"growth_potential_score":50,"work_life_balance_score":30,"overall_recommendation_score":52,"compensation_competitiveness_score":75},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T06:42:39.687Z","interview_intelligence":{"red_flags":[{"severity":"major","description":"Travel exceeds Joseph''s comfort level (>25%)","concern_type":"Travel Requirement","mitigation_strategy":"Discuss travel expectations during the interview."}],"success_factors":{"key_differentiators":["Strong technical skills","Ability to communicate complex solutions"],"cultural_fit_signals":["Diversity and inclusion focus"],"common_failure_points":["Inability to adapt to customer needs"]},"predicted_stages":[{"format":"video call","stage_name":"Initial Screening","focus_areas":["Technical skills","Cultural fit"],"typical_duration":"30 minutes","interviewer_roles":["HR","Hiring Manager"],"preparation_weight":7}],"technical_assessment":{"mock_demo_required":true,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":false,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Technical Skills","specific_topics":["API integrations","SaaS solutions"],"time_allocation":"2 hours","confidence_booster":true}]},"sales_engineering_signals":{"role_composition":{"confidence":0.8,"ae_se_ratio":null,"remote_onsite_mix":"onsite","travel_percentage":30,"presales_team_size":null,"demo_poc_percentage":50,"enablement_percentage":0,"architecture_percentage":20,"customer_interaction_percentage":30},"enablement_tooling":{"confidence":0.65,"tool_ownership":{"demo_automation":true,"internal_portals":false,"integration_tools":true,"playbook_creation":true},"content_creation":{"code_samples":true,"video_tutorials":false,"technical_whitepapers":false,"presentation_templates":true},"collaboration_scope":{"rnd_team":false,"product_team":true,"marketing_team":true,"customer_success":true},"training_responsibilities":{"internal_design":false,"internal_delivery":true,"partner_enablement":true,"customer_enablement":true}},"demo_poc_environment":{"confidence":0.7,"demo_count":{"demo_types":["customized demonstrations","product demonstrations"],"built_vs_maintained":null},"tech_stack":["API","SaaS"],"demo_tooling":["Salesforce","Custom demo tools"],"poc_characteristics":{"ownership_level":"high","typical_duration":"2-4 weeks","customer_count_avg":5,"success_criteria_defined":true},"complexity_indicators":{"multi_region":false,"data_integration":true,"custom_development":true,"regulatory_requirements":false}},"success_metrics_career":{"confidence":0.7,"kpis_mentioned":["Sales growth","Customer satisfaction"],"success_ownership":{"team_metrics":false,"individual_metrics":true,"revenue_attribution":true},"career_progression":{"growth_signals":true,"promotion_path":["Senior Sales Engineer","Sales Engineering Manager"],"leadership_opportunities":true},"technical_expectations":{"soft_skills_emphasis":["Communication","Problem-solving"],"tech_stack_preferences":["API","SaaS"],"certification_requirements":["Salesforce Certified"]}},"methodology_deal_context":{"confidence":0.75,"role_in_cycle":["Demo","PoC","RFI/RFP responses"],"sales_framework":["Solution Selling","Consultative Selling"],"customer_profile":{"target_verticals":["Transportation","Logistics","Construction"],"customer_size_focus":"Enterprise","strategic_logos_mentioned":true},"deal_characteristics":{"deal_complexity":"high","cycle_length_avg":"3-6 months","typical_acv_band":"$100k - $500k"},"competitive_landscape":{"direct_competitors_mentioned":["Teletrac Navman","Geotab"],"competitive_positioning_focus":true}}}}'::jsonb,
  NULL,
  85,
  'Led successful PoC initiatives and integrated APIs to enhance customer solutions in a sales engineering capacity.',
  '{"benefits":["health benefits","pharmacy benefits","optical care","dental care","paid time off","sick time off","short term and long term disability coverage","life insurance","401k contribution"],"comp_max":240000,"comp_min":180000,"industry":"Transportation & Logistics","tech_stack":["API","Python","SQL","Salesforce"],"company_size":"large","requirements":["5+ years working with Strategic-level sales prospects","Bachelor''s Degree required","Ability to travel ~30%","Excellent communication skills","Proven analytical and problem-solving skills","Experience with Strategic Enterprise sales cycles"],"comp_currency":"USD","remote_policy":null,"skills_sought":[{"type":"soft","level":"expert","skill":"Interpersonal communication"},{"type":"technical","level":"expert","skill":"Technical comprehension"},{"type":"technical","level":"expert","skill":"Product expertise"},{"type":"soft","level":"expert","skill":"Business acumen"},{"type":"soft","level":"expert","skill":"Analytical skills"},{"type":"soft","level":"expert","skill":"Problem-solving skills"}],"travel_required":"25-50%","requires_clearance":false,"experience_years_max":null,"experience_years_min":5}'::jsonb,
  0,
  NULL,
  'req_d6d41f02-5ec6-438d-845e-136024fb39c3',
  '2025-08-02T06:42:39.687+00:00',
  '2025-08-02T06:42:39.687+00:00',
  'Joseph''s strengths in PoC execution, API integrations, and consultative selling align well with the role''s requirements, but the travel expectation may be a concern.',
  ARRAY['PoC execution', 'API integrations', 'Technical discovery', 'Consultative selling'],
  ARRAY['Heavy travel expected (>25%)'],
  ARRAY['Joseph''s technical skills are a strong match for the product expertise required.', 'The role''s travel requirement exceeds Joseph''s comfort level, which could lead to dissatisfaction.'],
  '[{"type":"soft","level":"expert","skill":"Interpersonal communication"},{"type":"technical","level":"expert","skill":"Technical comprehension"},{"type":"technical","level":"expert","skill":"Product expertise"},{"type":"soft","level":"expert","skill":"Business acumen"},{"type":"soft","level":"expert","skill":"Analytical skills"},{"type":"soft","level":"expert","skill":"Problem-solving skills"}]'::jsonb,
  '2025-08-02T06:42:39.6967+00:00',
  '2025-08-02T06:42:39.6967+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- Enrichment: Senior Sales Engineer, West at Recorded Future
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  'bafd5f42-ffe0-4e50-bfa8-f744208f8aa4',
  'demo_admin',
  'completed',
  75,
  true,
  130000,
  200000,
  'USD',
  NULL,
  '["PoC execution","API integrations","consultative selling"]'::jsonb,
  '["deep expertise in cybersecurity areas like SOC/SIEM or Threat Intelligence"]'::jsonb,
  '["API","Python","SQL","Salesforce"]'::jsonb,
  ARRAY[]::text[],
  'Joseph is a strong candidate with relevant skills in technical sales and cybersecurity, but the travel requirement may be a dealbreaker.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Complete onboarding and training","required_support":["mentorship from senior team members"],"success_criteria":"Demonstrate understanding of products and processes.","stakeholder_impact":"Sales team"}],"direct_matches":[{"proof_point":"Successfully executed multiple PoC projects in previous roles.","talking_point":"Proven track record in leading PoC engagements.","joseph_strength":"PoC execution and ownership","impact_potential":"immediate","role_requirement":"lead complex pilot engagements"}],"demo_suggestions":[{"demo_concept":"API integration demo","business_value_story":"Showcasing how our solution integrates seamlessly with existing systems.","tech_stack_alignment":["API","Python"],"differentiation_factor":"Unique integration capabilities.","preparation_complexity":"moderate"}],"process_improvements":[{"joseph_solution":"Implement a standardized documentation template.","improvement_area":"Documentation of technical sales process","stakeholder_impact":["sales team","technical team"],"implementation_effort":"quick win","current_state_assumption":"Inconsistent documentation practices."}],"positioning_strategies":{"risk_mitigation":["Addressing customer concerns through tailored demos"],"growth_narrative":"Expanding into new verticals with proven solutions.","cultural_alignment":["Commitment to diversity and inclusion"],"competitive_advantages":["Strong customer base","High user ratings"],"unique_value_proposition":"Leading cybersecurity intelligence solutions."}},"correlation_id":"req_12037b95-0acb-4be6-8ca3-b1470962d2a3","implicit_risks":[],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":50,"growth_potential_score":50,"work_life_balance_score":30,"overall_recommendation_score":52,"compensation_competitiveness_score":75},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T06:43:16.036Z","interview_intelligence":{"red_flags":[{"severity":"major","description":"Travel requirement exceeds Joseph''s comfort level.","concern_type":"Travel Requirement","mitigation_strategy":"Discuss potential for remote work or reduced travel during interviews."}],"success_factors":{"key_differentiators":["strong technical background","consultative selling approach"],"cultural_fit_signals":["diversity and inclusion values"],"common_failure_points":["lack of specific cybersecurity experience"]},"predicted_stages":[{"format":"phone interview","stage_name":"Initial Screening","focus_areas":["technical skills","sales experience"],"typical_duration":"1 week","interviewer_roles":["HR","Hiring Manager"],"preparation_weight":7}],"technical_assessment":{"mock_demo_required":true,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":false,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Cybersecurity Knowledge","specific_topics":["SOC/SIEM","Threat Intelligence"],"time_allocation":"10 hours","confidence_booster":true}]},"sales_engineering_signals":{"role_composition":{"confidence":0.8,"ae_se_ratio":null,"remote_onsite_mix":"onsite","travel_percentage":30,"presales_team_size":null,"demo_poc_percentage":50,"enablement_percentage":0,"architecture_percentage":20,"customer_interaction_percentage":30},"enablement_tooling":{"confidence":0.7,"tool_ownership":{"demo_automation":false,"internal_portals":true,"integration_tools":false,"playbook_creation":true},"content_creation":{"code_samples":false,"video_tutorials":false,"technical_whitepapers":true,"presentation_templates":true},"collaboration_scope":{"rnd_team":false,"product_team":true,"marketing_team":true,"customer_success":true},"training_responsibilities":{"internal_design":true,"internal_delivery":true,"partner_enablement":false,"customer_enablement":true}},"demo_poc_environment":{"confidence":0.7,"demo_count":{"demo_types":["product demos","analytical scenarios"],"built_vs_maintained":null},"tech_stack":["API","Python","SQL"],"demo_tooling":[],"poc_characteristics":{"ownership_level":"high","typical_duration":"1-3 months","customer_count_avg":5,"success_criteria_defined":true},"complexity_indicators":{"multi_region":false,"data_integration":true,"custom_development":false,"regulatory_requirements":false}},"success_metrics_career":{"confidence":0.8,"kpis_mentioned":["customer satisfaction","sales growth"],"success_ownership":{"team_metrics":true,"individual_metrics":true,"revenue_attribution":true},"career_progression":{"growth_signals":true,"promotion_path":["Senior Sales Engineer","Sales Manager"],"leadership_opportunities":true},"technical_expectations":{"soft_skills_emphasis":["communication","collaboration"],"tech_stack_preferences":["SOC/SIEM","Threat Intelligence"],"certification_requirements":["CISSP","Security+"]}},"methodology_deal_context":{"confidence":0.75,"role_in_cycle":["lead technical discussions","support sales team"],"sales_framework":["consultative selling","solution selling"],"customer_profile":{"target_verticals":["enterprise","government"],"customer_size_focus":"large","strategic_logos_mentioned":true},"deal_characteristics":{"deal_complexity":"high","cycle_length_avg":"3-6 months","typical_acv_band":"$100k-$500k"},"competitive_landscape":{"direct_competitors_mentioned":["CrowdStrike","FireEye"],"competitive_positioning_focus":true}}}}'::jsonb,
  NULL,
  80,
  'Led successful PoC engagements and consultative selling in cybersecurity solutions.',
  '{"benefits":["medical","dental","vision","life insurance","401K","equity"],"comp_max":200000,"comp_min":130000,"industry":"cybersecurity","tech_stack":["API","Python","SQL","Salesforce"],"company_size":"large","requirements":["5 years'' experience as a Sales Engineer or Intelligence Analyst/Officer","Proven track record in a pre-sales role at a cybersecurity organization","Deep expertise in cybersecurity or threat intelligence"],"comp_currency":"USD","remote_policy":null,"skills_sought":[{"type":"technical","level":"advanced","skill":"cybersecurity expertise"},{"type":"technical","level":"advanced","skill":"technical engineering skills"},{"type":"soft","level":"advanced","skill":"analytical thinking"},{"type":"soft","level":"advanced","skill":"strategic business acumen"},{"type":"soft","level":"advanced","skill":"communication skills"},{"type":"soft","level":"advanced","skill":"collaboration skills"}],"travel_required":"25-50%","requires_clearance":false,"experience_years_max":null,"experience_years_min":5}'::jsonb,
  0,
  NULL,
  'req_12037b95-0acb-4be6-8ca3-b1470962d2a3',
  '2025-08-02T06:43:16.036+00:00',
  '2025-08-02T06:43:16.036+00:00',
  'Joseph has relevant experience in technical sales and cybersecurity, but the travel requirement exceeds his comfort level.',
  ARRAY['PoC execution and ownership', 'API integrations', 'consultative selling'],
  ARRAY['Travel requirement exceeds 25%', 'Potential for heavy enterprise politics'],
  ARRAY['The role emphasizes a blend of technical and sales skills, which aligns with Joseph''s strengths.', 'The requirement for travel up to 30% may not align with Joseph''s preferences.'],
  '[{"type":"technical","level":"advanced","skill":"cybersecurity expertise"},{"type":"technical","level":"advanced","skill":"technical engineering skills"},{"type":"soft","level":"advanced","skill":"analytical thinking"},{"type":"soft","level":"advanced","skill":"strategic business acumen"},{"type":"soft","level":"advanced","skill":"communication skills"},{"type":"soft","level":"advanced","skill":"collaboration skills"}]'::jsonb,
  '2025-08-02T06:43:16.047527+00:00',
  '2025-08-02T06:43:16.047527+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- Enrichment: Senior Sales Engineer at Clari
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  'e9cff2aa-1177-4b10-84e9-93072b0d0900',
  'demo_admin',
  'completed',
  85,
  false,
  145000,
  210000,
  'USD',
  'remote',
  '["PoC execution","API integrations","Salesforce experience","Technical discovery","Consultative selling"]'::jsonb,
  '["Experience with Revenue Operations landscape","Data Warehousing knowledge","Salesforce certifications"]'::jsonb,
  '["Salesforce","SaaS","APIs","Data Warehousing"]'::jsonb,
  ARRAY[]::text[],
  'Joseph''s experience aligns well with Clari''s Senior Sales Engineer role, particularly in PoC execution and Salesforce expertise, though he may need to strengthen his knowledge in Revenue Operations and Data Warehousing.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Complete onboarding and training","required_support":["Training materials","Mentorship"],"success_criteria":"Demonstrate understanding of Clari''s platform and customer needs.","stakeholder_impact":"Sales Team"}],"direct_matches":[{"proof_point":"Achieved a 30% increase in deal closure rates through effective PoC management.","talking_point":"Led successful enterprise-level PoCs resulting in significant software deals.","joseph_strength":"PoC execution and ownership","impact_potential":"immediate","role_requirement":"Experience running and managing enterprise-level proof of concepts (POC)"}],"demo_suggestions":[{"demo_concept":"Value narrative demo for CROs","business_value_story":"Demonstrate how Clari can enhance revenue predictability.","tech_stack_alignment":["Salesforce","APIs"],"differentiation_factor":"Focus on unique insights from existing customers.","preparation_complexity":"moderate"}],"process_improvements":[{"joseph_solution":"Implement regular syncs between sales and product teams.","improvement_area":"Internal collaboration","stakeholder_impact":["Sales Team","Product Team"],"implementation_effort":"quick win","current_state_assumption":"Limited cross-departmental collaboration."}],"positioning_strategies":{"risk_mitigation":["Emphasize low travel requirements","Highlight supportive culture"],"growth_narrative":"Join a company poised for significant growth in the revenue operations space.","cultural_alignment":["Focus on learning","Inclusivity"],"competitive_advantages":["Strong customer base","Innovative technology"],"unique_value_proposition":"Clari provides unparalleled revenue visibility and accuracy."}},"correlation_id":"req_78df2236-51fb-49b2-ad9e-adda9e37a533","implicit_risks":[{"reason":"Pattern \"stock options\" suggests compensation","category":"COMPENSATION","evidence":["ealth support provided by modern health • pre-ipo stock options • well-being and professional development stipend","ompensation package for this position may include stock options, benefits, stipends, perks and/or other applicabl","mental health support provided by modern health • pre-ipo stock options • well-being and professional devel"],"severity":"HIGH","confidence":0.75,"isImplicit":true,"isDealbreaker":false},{"reason":"Pattern \"growing team\" suggests role clarity","category":"ROLE_CLARITY","evidence":["re excited to welcome talented individuals to our growing team. we are actively hiring across multiple geographi"],"severity":"MEDIUM","confidence":0.6,"isImplicit":true,"isDealbreaker":false},{"reason":"Pattern \"proof of concept\" suggests company stability","category":"COMPANY_STABILITY","evidence":[" experience running and managing enterprise-level proof of concepts (poc) • experience with installing and administe"],"severity":"MEDIUM","confidence":0.6,"isImplicit":true,"isDealbreaker":false}],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":50,"growth_potential_score":50,"work_life_balance_score":60,"overall_recommendation_score":58,"compensation_competitiveness_score":75},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T06:44:35.811Z","interview_intelligence":{"red_flags":[{"severity":"minor","description":"Role may involve travel, though it is currently low.","concern_type":"Travel Expectation","mitigation_strategy":"Clarify travel expectations during the interview."},{"severity":"moderate","description":"Heavy enterprise politics could affect role effectiveness.","concern_type":"Enterprise Politics","mitigation_strategy":"Discuss company culture and politics during interviews."}],"success_factors":{"key_differentiators":["Strong technical skills","Ability to engage C-suite","Proven track record"],"cultural_fit_signals":["Emphasis on learning","Supportive environment"],"common_failure_points":["Inability to navigate enterprise politics","Lack of clear success metrics"]},"predicted_stages":[{"format":"video call","stage_name":"Initial Screening","focus_areas":["experience","cultural fit"],"typical_duration":"30 minutes","interviewer_roles":["HR","Hiring Manager"],"preparation_weight":7},{"format":"video call","stage_name":"Technical Interview","focus_areas":["technical skills","problem-solving"],"typical_duration":"1 hour","interviewer_roles":["Technical Lead","Sales Engineer"],"preparation_weight":8},{"format":"in-person or video call","stage_name":"Final Interview","focus_areas":["cultural fit","strategic vision"],"typical_duration":"1 hour","interviewer_roles":["CRO","VP of Sales"],"preparation_weight":9}],"technical_assessment":{"mock_demo_required":true,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":false,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Technical Skills","specific_topics":["Salesforce","APIs","SaaS"],"time_allocation":"3 hours","confidence_booster":true},{"priority_area":"Cultural Fit","specific_topics":["Company values","Team dynamics"],"time_allocation":"2 hours","confidence_booster":true}]},"sales_engineering_signals":{"role_composition":{"confidence":0.9,"ae_se_ratio":"1:3","remote_onsite_mix":"remote","travel_percentage":10,"presales_team_size":"medium","demo_poc_percentage":60,"enablement_percentage":20,"architecture_percentage":20,"customer_interaction_percentage":80},"enablement_tooling":{"confidence":0.85,"tool_ownership":{"demo_automation":true,"internal_portals":false,"integration_tools":true,"playbook_creation":true},"content_creation":{"code_samples":true,"video_tutorials":false,"technical_whitepapers":true,"presentation_templates":true},"collaboration_scope":{"rnd_team":false,"product_team":true,"marketing_team":true,"customer_success":true},"training_responsibilities":{"internal_design":true,"internal_delivery":true,"partner_enablement":false,"customer_enablement":true}},"demo_poc_environment":{"confidence":0.85,"demo_count":{"demo_types":["value narrative","technical demonstration"],"built_vs_maintained":"built"},"tech_stack":["Salesforce","SaaS","APIs"],"demo_tooling":["Salesforce Demo Tools"],"poc_characteristics":{"ownership_level":"high","typical_duration":"2-4 weeks","customer_count_avg":5,"success_criteria_defined":true},"complexity_indicators":{"multi_region":true,"data_integration":true,"custom_development":true,"regulatory_requirements":false}},"success_metrics_career":{"confidence":0.9,"kpis_mentioned":["deal closure rate","customer satisfaction","revenue growth"],"success_ownership":{"team_metrics":true,"individual_metrics":true,"revenue_attribution":true},"career_progression":{"growth_signals":true,"promotion_path":["Senior Sales Engineer","Sales Manager","CRO"],"leadership_opportunities":true},"technical_expectations":{"soft_skills_emphasis":["communication","consultative selling"],"tech_stack_preferences":["Salesforce","APIs"],"certification_requirements":["Salesforce Certified","Technical certifications"]}},"methodology_deal_context":{"confidence":0.9,"role_in_cycle":["Technical discovery","Demo delivery","POC management"],"sales_framework":["Solution Selling","Consultative Selling"],"customer_profile":{"target_verticals":["Technology","Finance","Healthcare"],"customer_size_focus":"enterprise","strategic_logos_mentioned":true},"deal_characteristics":{"deal_complexity":"high","cycle_length_avg":"3-6 months","typical_acv_band":"$100k-$500k"},"competitive_landscape":{"direct_competitors_mentioned":["Salesforce","HubSpot"],"competitive_positioning_focus":true}}}}'::jsonb,
  NULL,
  90,
  'Led successful enterprise-level proof of concepts (PoCs) resulting in significant software deals with C-suite executives.',
  '{"benefits":["Remote-first work","Medical, dental, vision insurance","Mental health support","Pre-IPO stock options","401(k) plan","Discretionary paid time off","Paid parental leave"],"comp_max":210000,"comp_min":145000,"industry":"Software","tech_stack":["Salesforce","SaaS","APIs","Data Warehousing"],"company_size":"large","requirements":["5+ years in a pre-sales role","Experience with enterprise accounts","Technical discovery and consultative selling skills"],"comp_currency":"USD","remote_policy":"remote","skills_sought":[{"type":"experience","level":"5+","skill":"pre-sales experience"},{"type":"experience","level":"basic","skill":"Salesforce administration"},{"type":"experience","level":"proven","skill":"software deal closing"},{"type":"experience","level":"proven","skill":"enterprise-level POCs"},{"type":"experience","level":"basic","skill":"SaaS application management"},{"type":"knowledge","level":"working","skill":"APIs knowledge"},{"type":"knowledge","level":"plus","skill":"Revenue Operations"},{"type":"knowledge","level":"plus","skill":"Data Warehousing"},{"type":"certification","level":"plus","skill":"Salesforce certifications"},{"type":"knowledge","level":"basic","skill":"JSON knowledge"}],"travel_required":"0-25%","requires_clearance":false,"experience_years_max":null,"experience_years_min":5}'::jsonb,
  0,
  NULL,
  'req_78df2236-51fb-49b2-ad9e-adda9e37a533',
  '2025-08-02T06:44:35.811+00:00',
  '2025-08-02T06:44:35.811+00:00',
  'Joseph has strong experience in PoC execution, API integrations, and Salesforce, aligning well with the role''s requirements.',
  ARRAY['PoC execution and ownership', 'Technical discovery and consultative selling', 'Salesforce (Marketing Cloud & CRM)'],
  ARRAY['Potential for heavy enterprise politics', 'Unclear success criteria in some aspects of the role'],
  ARRAY['The role is remote, which aligns with Joseph''s preference for flexibility.', 'Travel requirement is low (0-25%), which is favorable given Joseph''s red flag regarding heavy travel.', 'The company culture emphasizes inclusivity and growth, which may appeal to Joseph.'],
  '[{"type":"experience","level":"5+","skill":"pre-sales experience"},{"type":"experience","level":"basic","skill":"Salesforce administration"},{"type":"experience","level":"proven","skill":"software deal closing"},{"type":"experience","level":"proven","skill":"enterprise-level POCs"},{"type":"experience","level":"basic","skill":"SaaS application management"},{"type":"knowledge","level":"working","skill":"APIs knowledge"},{"type":"knowledge","level":"plus","skill":"Revenue Operations"},{"type":"knowledge","level":"plus","skill":"Data Warehousing"},{"type":"certification","level":"plus","skill":"Salesforce certifications"},{"type":"knowledge","level":"basic","skill":"JSON knowledge"}]'::jsonb,
  '2025-08-02T06:44:35.822364+00:00',
  '2025-08-02T06:44:35.822364+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- Enrichment: Head of Product Marketing at Vercel
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  'a038a520-6c0f-4cc9-b487-4fa3293157de',
  'demo_admin',
  'completed',
  40,
  false,
  NULL,
  NULL,
  'USD',
  'remote',
  '["API integrations","Technical discovery","Consultative selling"]'::jsonb,
  '["product marketing","leadership in marketing","B2B SaaS marketing"]'::jsonb,
  '["Next.js","Vercel platform","v0","AI SDK","Turbo.dev"]'::jsonb,
  ARRAY[]::text[],
  'Joseph has strong technical skills but lacks the necessary product marketing experience and leadership in that domain, which is critical for this role.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Understand product offerings","required_support":["Mentorship from marketing team","Access to product training"],"success_criteria":"Ability to articulate product value propositions","stakeholder_impact":"Marketing team, Product team"}],"direct_matches":[{"proof_point":"Successful integration of APIs in previous roles.","talking_point":"Joseph''s ability to understand technical products can aid in crafting narratives.","joseph_strength":"Technical discovery and consultative selling","impact_potential":"short-term","role_requirement":"Strong experience in product marketing for technical products"}],"demo_suggestions":[],"process_improvements":[],"positioning_strategies":{"risk_mitigation":["Highlighting technical experience in interviews"],"growth_narrative":"Joseph can leverage his technical skills to enhance marketing strategies.","cultural_alignment":["Team-oriented","Innovative mindset"],"competitive_advantages":["Technical credibility","Understanding of developer needs"],"unique_value_proposition":"Joseph''s technical expertise can bridge the gap between product and marketing."}},"correlation_id":"req_25807f02-0ac6-4849-b53a-9d2b45199e80","implicit_risks":[{"reason":"Pattern \"stock options\" suggests compensation","category":"COMPENSATION","evidence":["ce is. benefits: • great compensation package and stock options. • inclusive healthcare package. • learn and grow"],"severity":"HIGH","confidence":0.7,"isImplicit":true,"isDealbreaker":false}],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":50,"growth_potential_score":50,"work_life_balance_score":70,"overall_recommendation_score":54,"compensation_competitiveness_score":50},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T06:45:22.993Z","interview_intelligence":{"red_flags":[{"severity":"major","description":"Joseph lacks direct product marketing experience which is critical for this role.","concern_type":"Lack of relevant experience","mitigation_strategy":"Focus on transferable skills and technical expertise during interviews."}],"success_factors":{"key_differentiators":["Strong technical background","Ability to communicate with developers"],"cultural_fit_signals":["Team-oriented mindset","Innovative thinking"],"common_failure_points":["Inability to create marketing strategies"]},"predicted_stages":[{"format":"phone","stage_name":"Initial Screening","focus_areas":["Cultural fit","Basic qualifications"],"typical_duration":"30 minutes","interviewer_roles":["HR","Hiring Manager"],"preparation_weight":5}],"technical_assessment":{"mock_demo_required":false,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":false,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Product Marketing Knowledge","specific_topics":["B2B SaaS marketing","Product positioning"],"time_allocation":"2 hours","confidence_booster":true}]},"sales_engineering_signals":{"role_composition":{"confidence":0.5,"ae_se_ratio":null,"remote_onsite_mix":"remote","travel_percentage":0,"presales_team_size":null,"demo_poc_percentage":0,"enablement_percentage":0,"architecture_percentage":0,"customer_interaction_percentage":0},"enablement_tooling":{"confidence":0.5,"tool_ownership":{"demo_automation":false,"internal_portals":false,"integration_tools":false,"playbook_creation":false},"content_creation":{"code_samples":false,"video_tutorials":false,"technical_whitepapers":false,"presentation_templates":false},"collaboration_scope":{"rnd_team":false,"product_team":false,"marketing_team":true,"customer_success":false},"training_responsibilities":{"internal_design":false,"internal_delivery":false,"partner_enablement":false,"customer_enablement":false}},"demo_poc_environment":{"confidence":0.5,"demo_count":{"demo_types":[],"built_vs_maintained":null},"tech_stack":[],"demo_tooling":[],"poc_characteristics":{"ownership_level":null,"typical_duration":null,"customer_count_avg":null,"success_criteria_defined":false},"complexity_indicators":{"multi_region":false,"data_integration":false,"custom_development":false,"regulatory_requirements":false}},"success_metrics_career":{"confidence":0.5,"kpis_mentioned":[],"success_ownership":{"team_metrics":false,"individual_metrics":false,"revenue_attribution":false},"career_progression":{"growth_signals":false,"promotion_path":[],"leadership_opportunities":false},"technical_expectations":{"soft_skills_emphasis":[],"tech_stack_preferences":[],"certification_requirements":[]}},"methodology_deal_context":{"confidence":0.5,"role_in_cycle":[],"sales_framework":[],"customer_profile":{"target_verticals":[],"customer_size_focus":"large","strategic_logos_mentioned":false},"deal_characteristics":{"deal_complexity":null,"cycle_length_avg":null,"typical_acv_band":null},"competitive_landscape":{"direct_competitors_mentioned":[],"competitive_positioning_focus":false}}}}'::jsonb,
  NULL,
  70,
  'Led technical discovery and consultative selling efforts, integrating APIs to enhance product offerings.',
  '{"benefits":["Great compensation package and stock options","Inclusive Healthcare Package","Flexible Time Off","Remote Friendly"],"comp_max":null,"comp_min":null,"industry":"technology","tech_stack":["Next.js","Vercel platform","v0","AI SDK","Turbo.dev"],"company_size":"large","requirements":["Deep understanding of the developer ecosystem","Strong experience in product marketing for technical products","Passion for Next.js and Vercel platform","Exceptional leadership and communication skills","Excellent project management skills"],"comp_currency":"USD","remote_policy":"remote","skills_sought":[{"type":"experience","level":"senior","skill":"product marketing"},{"type":"knowledge","level":"expert","skill":"frontend technologies"},{"type":"experience","level":"senior","skill":"B2B SaaS marketing"},{"type":"soft skill","level":"senior","skill":"leadership"},{"type":"experience","level":"senior","skill":"project management"}],"travel_required":"none","requires_clearance":false,"experience_years_max":null,"experience_years_min":8}'::jsonb,
  0,
  NULL,
  'req_25807f02-0ac6-4849-b53a-9d2b45199e80',
  '2025-08-02T06:45:22.993+00:00',
  '2025-08-02T06:45:22.993+00:00',
  'Joseph''s background as a Senior Sales Engineer aligns with technical aspects of the role, but lacks direct product marketing experience.',
  ARRAY['Technical discovery and consultative selling', 'API integrations'],
  ARRAY['Lack of direct product marketing experience', 'Potential cultural mismatch with marketing focus'],
  ARRAY['The role requires a strong marketing background which Joseph may not possess.', 'Joseph''s technical strengths may not be fully utilized in a marketing leadership position.'],
  '[{"type":"experience","level":"senior","skill":"product marketing"},{"type":"knowledge","level":"expert","skill":"frontend technologies"},{"type":"experience","level":"senior","skill":"B2B SaaS marketing"},{"type":"soft skill","level":"senior","skill":"leadership"},{"type":"experience","level":"senior","skill":"project management"}]'::jsonb,
  '2025-08-02T06:45:22.995211+00:00',
  '2025-08-02T06:45:22.995211+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- Enrichment: Partner Solutions Engineer at Vercel
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  '2d65b95b-cad6-45ec-a800-2f81d8b6c849',
  'demo_admin',
  'completed',
  85,
  false,
  168000,
  230000,
  'USD',
  'remote',
  '["API integrations","technical discovery","consultative selling"]'::jsonb,
  '["building and launching ecommerce applications","developer relations experience"]'::jsonb,
  '["Next.js","React","Vercel","cloud infrastructure","frontend development"]'::jsonb,
  ARRAY[]::text[],
  'Joseph''s background in technical sales and API integrations aligns well with the Partner Solutions Engineer role at Vercel. His strengths in PoC execution and consultative selling will be beneficial, but he may need to bolster his experience in ecommerce applications.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Establish relationships with key partners","required_support":["introduction to partners","access to resources"],"success_criteria":"Regular communication and feedback loops","stakeholder_impact":"partner teams"}],"direct_matches":[{"proof_point":"Successfully led PoCs for multiple clients","talking_point":"Experience in leading technical projects","joseph_strength":"PoC execution","impact_potential":"immediate","role_requirement":"serve as subject matter expert"}],"demo_suggestions":[{"demo_concept":"Integrating Vercel with an ecommerce platform","business_value_story":"Showcasing seamless integration to enhance user experience","tech_stack_alignment":["Next.js","Vercel"],"differentiation_factor":"Focus on performance optimization","preparation_complexity":"moderate"}],"process_improvements":[{"joseph_solution":"Develop comprehensive training modules","improvement_area":"Technical training for partners","stakeholder_impact":["partner teams","sales teams"],"implementation_effort":"medium term","current_state_assumption":"Limited training resources available"}],"positioning_strategies":{"risk_mitigation":["demonstrate relevant experience in ecommerce"],"growth_narrative":"Leverage technical skills to drive product adoption","cultural_alignment":["innovation-driven","collaborative environment"],"competitive_advantages":["strong technical background","experience in consultative selling"],"unique_value_proposition":"Expertise in technical solutions and customer engagement"}},"correlation_id":"req_45d84dae-c50e-4bed-b7cd-a0fd7d6f1eae","implicit_risks":[{"reason":"Pattern \"fast-paced environment\" suggests culture mismatch","category":"CULTURE_MISMATCH","evidence":["s-driven mindset and are experienced working in a fast-paced environment. • you are comfortable working with remote, globa"],"severity":"MEDIUM","confidence":0.6,"isImplicit":true,"isDealbreaker":false}],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":40,"growth_potential_score":50,"work_life_balance_score":60,"overall_recommendation_score":56,"compensation_competitiveness_score":75},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T06:46:11.131Z","interview_intelligence":{"red_flags":[{"severity":"major","description":"Lack of explicit ecommerce experience may hinder role fit.","concern_type":"experience gap","mitigation_strategy":"Prepare to discuss transferable skills and relevant projects."}],"success_factors":{"key_differentiators":["strong technical background","relationship management skills"],"cultural_fit_signals":["collaborative mindset","passion for technology"],"common_failure_points":["inability to articulate technical concepts","lack of ecommerce knowledge"]},"predicted_stages":[{"format":"video call","stage_name":"Initial Screening","focus_areas":["technical skills","cultural fit"],"typical_duration":"1 week","interviewer_roles":["HR","hiring manager"],"preparation_weight":7},{"format":"technical assessment","stage_name":"Technical Interview","focus_areas":["technical knowledge","problem-solving"],"typical_duration":"1 week","interviewer_roles":["technical lead","senior engineer"],"preparation_weight":8},{"format":"in-person or video","stage_name":"Final Interview","focus_areas":["team dynamics","strategic vision"],"typical_duration":"1 week","interviewer_roles":["VP of Sales","CTO"],"preparation_weight":9}],"technical_assessment":{"mock_demo_required":true,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":true,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Technical Skills","specific_topics":["Next.js","Vercel integrations"],"time_allocation":"10 hours","confidence_booster":true},{"priority_area":"Sales Strategy","specific_topics":["consultative selling","ecommerce trends"],"time_allocation":"5 hours","confidence_booster":false}]},"sales_engineering_signals":{"role_composition":{"confidence":0.8,"ae_se_ratio":"1:1","remote_onsite_mix":"remote","travel_percentage":20,"presales_team_size":"medium","demo_poc_percentage":40,"enablement_percentage":20,"architecture_percentage":30,"customer_interaction_percentage":30},"enablement_tooling":{"confidence":0.7,"tool_ownership":{"demo_automation":true,"internal_portals":false,"integration_tools":true,"playbook_creation":true},"content_creation":{"code_samples":true,"video_tutorials":false,"technical_whitepapers":true,"presentation_templates":true},"collaboration_scope":{"rnd_team":false,"product_team":true,"marketing_team":true,"customer_success":true},"training_responsibilities":{"internal_design":true,"internal_delivery":true,"partner_enablement":true,"customer_enablement":true}},"demo_poc_environment":{"confidence":0.75,"demo_count":{"demo_types":["workshops","presentations"],"built_vs_maintained":"built"},"tech_stack":["Next.js","Vercel","cloud infrastructure"],"demo_tooling":["custom templates","workshops"],"poc_characteristics":{"ownership_level":"high","typical_duration":"2-4 weeks","customer_count_avg":5,"success_criteria_defined":true},"complexity_indicators":{"multi_region":false,"data_integration":true,"custom_development":true,"regulatory_requirements":false}},"success_metrics_career":{"confidence":0.8,"kpis_mentioned":["adoption rates","customer satisfaction"],"success_ownership":{"team_metrics":true,"individual_metrics":true,"revenue_attribution":true},"career_progression":{"growth_signals":true,"promotion_path":["senior engineer","lead engineer"],"leadership_opportunities":true},"technical_expectations":{"soft_skills_emphasis":["communication","relationship building"],"tech_stack_preferences":["Next.js","Vercel"],"certification_requirements":[]}},"methodology_deal_context":{"confidence":0.7,"role_in_cycle":["technical validation","solution design"],"sales_framework":["solution selling","consultative selling"],"customer_profile":{"target_verticals":["ecommerce","technology"],"customer_size_focus":"enterprise","strategic_logos_mentioned":true},"deal_characteristics":{"deal_complexity":"medium","cycle_length_avg":"3-6 months","typical_acv_band":"$100k-$500k"},"competitive_landscape":{"direct_competitors_mentioned":["Netlify","AWS Amplify"],"competitive_positioning_focus":true}}}}'::jsonb,
  NULL,
  80,
  'Led technical engagements and built strong partnerships to drive product adoption and business impact in a fast-paced environment.',
  '{"benefits":["competitive compensation package","inclusive healthcare package","mentorship opportunities","flexible time off","work-from-home budget"],"comp_max":230000,"comp_min":168000,"industry":"technology","tech_stack":["Next.js","React","Vercel","cloud infrastructure","frontend development"],"company_size":"large","requirements":["4+ years as a solutions engineer","6+ years building frontend applications","experience with ecommerce platforms","results-driven mindset","excellent communication skills"],"comp_currency":"USD","remote_policy":"remote","skills_sought":[{"type":"technical","level":"expert","skill":"web architecture"},{"type":"technical","level":"expert","skill":"frontend development"},{"type":"technical","level":"expert","skill":"serverless computing"},{"type":"soft","level":"expert","skill":"developer relations"},{"type":"soft","level":"expert","skill":"communication"}],"travel_required":"0-25%","requires_clearance":false,"experience_years_max":null,"experience_years_min":6}'::jsonb,
  0,
  NULL,
  'req_45d84dae-c50e-4bed-b7cd-a0fd7d6f1eae',
  '2025-08-02T06:46:11.131+00:00',
  '2025-08-02T06:46:11.131+00:00',
  'Joseph''s strengths in technical discovery, consultative selling, and API integrations align well with the role''s requirements for technical expertise and relationship building. However, his experience with ecommerce applications is not explicitly mentioned.',
  ARRAY['PoC execution', 'ownership', 'consultative selling'],
  ARRAY['lack of explicit ecommerce experience', 'potential for enterprise politics'],
  ARRAY['The role is focused on building relationships and technical solutions, which aligns with Joseph''s strengths.', 'Remote work is an advantage for Joseph, as he prefers to avoid heavy travel.', 'The emphasis on ecommerce experience may require Joseph to quickly upskill or demonstrate relevant experience.'],
  '[{"type":"technical","level":"expert","skill":"web architecture"},{"type":"technical","level":"expert","skill":"frontend development"},{"type":"technical","level":"expert","skill":"serverless computing"},{"type":"soft","level":"expert","skill":"developer relations"},{"type":"soft","level":"expert","skill":"communication"}]'::jsonb,
  '2025-08-02T06:46:11.134762+00:00',
  '2025-08-02T06:46:11.134762+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- Enrichment: Mid-Level Pre-Sales Engineer (Remote) at Jobright.ai
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  '14f23924-0b96-43e4-9c39-31ef14ad8456',
  'demo_admin',
  'completed',
  75,
  true,
  NULL,
  NULL,
  'USD',
  'remote',
  '["PoC execution","API integrations","Python","SQL","Salesforce"]'::jsonb,
  '["familiarity with cloud data platforms","experience in marketing operations"]'::jsonb,
  '["AI-powered marketing","cloud data platforms","martech","data warehouses"]'::jsonb,
  ARRAY[]::text[],
  'Joseph''s strong technical skills and consultative selling experience make him a good fit for the technical aspects of the role, but the travel requirement and potential for enterprise politics may be significant drawbacks.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Establish rapport with sales team","required_support":["mentorship from senior sales members"],"success_criteria":"Build strong working relationships and trust.","stakeholder_impact":"sales team"}],"direct_matches":[{"proof_point":"Successfully executed multiple PoCs that resulted in increased sales.","talking_point":"Joseph''s experience in leading PoCs","joseph_strength":"PoC execution and ownership","impact_potential":"immediate","role_requirement":"technical authority"}],"demo_suggestions":[{"demo_concept":"AI-Powered Marketing Solutions","business_value_story":"Demonstrating how AI can optimize marketing strategies and drive growth.","tech_stack_alignment":["AI-powered marketing","cloud data platforms"],"differentiation_factor":"Focus on unique AI capabilities.","preparation_complexity":"moderate"}],"process_improvements":[{"joseph_solution":"Implement structured engagement plans for prospects.","improvement_area":"Customer Engagement","stakeholder_impact":["sales team","marketing team"],"implementation_effort":"quick win","current_state_assumption":"Limited engagement strategies."}],"positioning_strategies":{"risk_mitigation":["addressing travel concerns upfront"],"growth_narrative":"Leveraging AI to transform marketing strategies.","cultural_alignment":["collaborative environment","startup agility"],"competitive_advantages":["strong technical background","consultative selling approach"],"unique_value_proposition":"Combining technical expertise with marketing insights."}},"correlation_id":"req_55955ea8-64df-47ec-87c5-12fb874923fe","implicit_risks":[],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":50,"growth_potential_score":50,"work_life_balance_score":50,"overall_recommendation_score":50,"compensation_competitiveness_score":50},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T06:46:57.930Z","interview_intelligence":{"red_flags":[{"severity":"major","description":"Role requires 25-50% travel, which is a dealbreaker for Joseph.","concern_type":"Travel Requirement","mitigation_strategy":"Discuss potential for remote engagement or reduced travel."}],"success_factors":{"key_differentiators":["strong technical skills","ability to tailor solutions"],"cultural_fit_signals":["collaborative mindset","proactive approach"],"common_failure_points":["lack of marketing operations experience"]},"predicted_stages":[{"format":"phone interview","stage_name":"Initial Screening","focus_areas":["technical skills","cultural fit"],"typical_duration":"1 week","interviewer_roles":["HR","Hiring Manager"],"preparation_weight":7}],"technical_assessment":{"mock_demo_required":true,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":false,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Technical Skills","specific_topics":["cloud data platforms","AI in marketing"],"time_allocation":"3 hours","confidence_booster":true}]},"sales_engineering_signals":{"role_composition":{"confidence":0.8,"ae_se_ratio":null,"remote_onsite_mix":"remote","travel_percentage":40,"presales_team_size":null,"demo_poc_percentage":40,"enablement_percentage":10,"architecture_percentage":20,"customer_interaction_percentage":30},"enablement_tooling":{"confidence":0.6,"tool_ownership":{"demo_automation":false,"internal_portals":false,"integration_tools":false,"playbook_creation":false},"content_creation":{"code_samples":false,"video_tutorials":false,"technical_whitepapers":false,"presentation_templates":false},"collaboration_scope":{"rnd_team":false,"product_team":true,"marketing_team":true,"customer_success":true},"training_responsibilities":{"internal_design":false,"internal_delivery":false,"partner_enablement":false,"customer_enablement":true}},"demo_poc_environment":{"confidence":0.7,"demo_count":{"demo_types":[],"built_vs_maintained":null},"tech_stack":["AI-powered marketing","cloud data platforms"],"demo_tooling":[],"poc_characteristics":{"ownership_level":"high","typical_duration":null,"customer_count_avg":null,"success_criteria_defined":true},"complexity_indicators":{"multi_region":false,"data_integration":true,"custom_development":false,"regulatory_requirements":false}},"success_metrics_career":{"confidence":0.6,"kpis_mentioned":[],"success_ownership":{"team_metrics":false,"individual_metrics":true,"revenue_attribution":false},"career_progression":{"growth_signals":true,"promotion_path":[],"leadership_opportunities":false},"technical_expectations":{"soft_skills_emphasis":["communication","storytelling"],"tech_stack_preferences":[],"certification_requirements":[]}},"methodology_deal_context":{"confidence":0.7,"role_in_cycle":["qualifying opportunities","delivering tailored product insights"],"sales_framework":[],"customer_profile":{"target_verticals":[],"customer_size_focus":"medium to large","strategic_logos_mentioned":false},"deal_characteristics":{"deal_complexity":"medium","cycle_length_avg":null,"typical_acv_band":null},"competitive_landscape":{"direct_competitors_mentioned":[],"competitive_positioning_focus":true}}}}'::jsonb,
  NULL,
  80,
  'Led successful PoC executions and API integrations, enhancing customer engagement and driving sales.',
  '{"benefits":[],"comp_max":null,"comp_min":null,"industry":"martech","tech_stack":["AI-powered marketing","cloud data platforms","martech","data warehouses"],"company_size":"medium","requirements":[],"comp_currency":"USD","remote_policy":"remote","skills_sought":[{"type":"technical","level":"mid-level","skill":"sales engineering"},{"type":"soft","level":"mid-level","skill":"customer engagement"},{"type":"technical","level":"mid-level","skill":"solution tailoring"},{"type":"technical","level":"mid-level","skill":"product demonstrations"},{"type":"knowledge","level":"mid-level","skill":"industry trends"}],"travel_required":"25-50%","requires_clearance":false,"experience_years_max":null,"experience_years_min":3}'::jsonb,
  0,
  NULL,
  'req_55955ea8-64df-47ec-87c5-12fb874923fe',
  '2025-08-02T06:46:57.93+00:00',
  '2025-08-02T06:46:57.93+00:00',
  'Joseph''s experience in technical discovery and consultative selling aligns well with the role''s requirements for customer engagement and solution tailoring. However, the expected travel requirement exceeds Joseph''s comfort level.',
  ARRAY['PoC execution and ownership', 'API integrations', 'consultative selling'],
  ARRAY['heavy travel requirement', 'potential for enterprise politics'],
  ARRAY['The role requires a strong understanding of marketing operations, which Joseph may need to bolster.', 'Joseph''s technical skills align well with the demands of the position, particularly in delivering product demos and engaging with customers.'],
  '[{"type":"technical","level":"mid-level","skill":"sales engineering"},{"type":"soft","level":"mid-level","skill":"customer engagement"},{"type":"technical","level":"mid-level","skill":"solution tailoring"},{"type":"technical","level":"mid-level","skill":"product demonstrations"},{"type":"knowledge","level":"mid-level","skill":"industry trends"}]'::jsonb,
  '2025-08-02T06:46:57.933262+00:00',
  '2025-08-02T06:46:57.933262+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- Enrichment: Enterprise Solutions Engineer- WEST at Hightouch
INSERT INTO job_enrichments (
  job_id, profile_uid, status, ai_fit_score, dealbreaker_hit,
  comp_min, comp_max, comp_currency, remote_policy,
  skills_matched, skills_gap, tech_stack, ai_resume_tips,
  ai_tailored_summary, risks, raw_json, skill_coverage_pct,
  confidence_score, resume_bullet, extracted_fields,
  error_count, last_error, correlation_id,
  enrichment_started_at, enrichment_completed_at,
  fit_reasoning, key_strengths, concerns, insights,
  skills_sought, created_at, updated_at,
  compensation_competitiveness_score, growth_opportunity_score,
  tech_innovation_score, team_culture_score,
  work_life_balance_score, location_flexibility_score,
  sales_engineering_signals, interview_intelligence, quick_wins
) VALUES (
  'ae6a11d6-143f-48da-9974-a3d67988feb6',
  'demo_admin',
  'completed',
  85,
  false,
  190000,
  220000,
  'USD',
  'remote',
  '["PoC execution","API integrations","Technical discovery","Consultative selling"]'::jsonb,
  '["Experience selling Martech and/or Data Solutions","Experience with Customer Data Platforms"]'::jsonb,
  '["Cloud Warehouses","Data Engineering","Data Analytics","Data Modeling","APIs"]'::jsonb,
  ARRAY[]::text[],
  'Joseph''s technical skills and sales experience make him a strong candidate for the Enterprise Solutions Engineer role at Hightouch, particularly in engaging with technical stakeholders and crafting solutions. However, he should be cautious about the potential for enterprise politics and travel requirements.',
  NULL,
  '{"quick_wins":{"first_90_days":[{"milestone":"Complete onboarding and training","required_support":["Mentorship from Senior Engineers","Access to training materials"],"success_criteria":"Demonstrate understanding of Hightouch''s solutions.","stakeholder_impact":"Sales Team"},{"milestone":"Engage with initial customers","required_support":["Customer Success Team","Sales Team"],"success_criteria":"Conduct successful technical discovery sessions.","stakeholder_impact":"Customers"}],"direct_matches":[{"proof_point":"Successfully led multiple technical discovery sessions.","talking_point":"Ability to uncover customer needs effectively.","joseph_strength":"Technical discovery","impact_potential":"immediate","role_requirement":"Strong discovery and interpersonal skills"},{"proof_point":"Executed numerous API integration projects.","talking_point":"Deep understanding of API integrations.","joseph_strength":"API integrations","impact_potential":"short-term","role_requirement":"Experience with APIs"}],"demo_suggestions":[{"demo_concept":"Customer Data Activation","business_value_story":"Show how Hightouch can streamline customer data usage.","tech_stack_alignment":["APIs","Data Engineering"],"differentiation_factor":"Focus on real-world use cases.","preparation_complexity":"moderate"}],"process_improvements":[{"joseph_solution":"Implement structured engagement frameworks.","improvement_area":"Customer Engagement","stakeholder_impact":["Sales Team","Customer Success"],"implementation_effort":"medium term","current_state_assumption":"Engagement processes may be inefficient."}],"positioning_strategies":{"risk_mitigation":["Clear success criteria","Defined customer engagement processes"],"growth_narrative":"Leverage data to drive marketing success.","cultural_alignment":["Team collaboration","Customer-centric approach"],"competitive_advantages":["Strong customer base","Innovative technology"],"unique_value_proposition":"Hightouch enables personalized customer experiences through data."}},"correlation_id":"req_580bc8c7-316a-4f35-9b18-7256aeb74749","implicit_risks":[{"reason":"Pattern \"equity compensation\" suggests compensation","category":"COMPENSATION","evidence":["our remote-first policy. we also offer meaningful equity compensation in the form of iso options, and offer early exerc"],"severity":"HIGH","confidence":0.7,"isImplicit":true,"isDealbreaker":false}],"prompt_version":"3.0","dimensional_scores":{"culture_fit_score":50,"growth_potential_score":50,"work_life_balance_score":60,"overall_recommendation_score":58,"compensation_competitiveness_score":75},"enrichment_version":"3.0","validation_warnings":["Missing dimensional scores: culture_fit_score, growth_potential_score, work_life_balance_score, compensation_competitiveness_score, overall_recommendation_score"],"enrichment_timestamp":"2025-08-02T06:52:10.459Z","interview_intelligence":{"red_flags":[{"severity":"major","description":"Role may involve more travel than Joseph is comfortable with.","concern_type":"Travel Requirements","mitigation_strategy":"Clarify travel expectations during the interview."},{"severity":"moderate","description":"Potential for navigating complex enterprise environments.","concern_type":"Enterprise Politics","mitigation_strategy":"Ask about company culture and internal processes."}],"success_factors":{"key_differentiators":["Strong Technical Skills","Ability to Communicate Complex Concepts"],"cultural_fit_signals":["Growth Mindset","Team Collaboration"],"common_failure_points":["Inability to Adapt to Customer Needs","Poor Communication"]},"predicted_stages":[{"format":"Video Call","stage_name":"Initial Screening","focus_areas":["Cultural Fit","Technical Skills"],"typical_duration":"1 week","interviewer_roles":["HR","Hiring Manager"],"preparation_weight":7},{"format":"Video Call","stage_name":"Technical Interview","focus_areas":["Technical Knowledge","Problem Solving"],"typical_duration":"1 week","interviewer_roles":["Technical Lead","Solutions Architect"],"preparation_weight":8},{"format":"In-Person/Video Call","stage_name":"Final Interview","focus_areas":["Sales Strategy","Customer Engagement"],"typical_duration":"1 week","interviewer_roles":["Sales Director","C-Level"],"preparation_weight":9}],"technical_assessment":{"mock_demo_required":true,"take_home_assignment":false,"presentation_required":true,"live_coding_likelihood":"unlikely","system_design_expected":false,"whiteboarding_expected":false},"preparation_priorities":[{"priority_area":"Technical Knowledge","specific_topics":["Data Solutions","APIs","Customer Data Platforms"],"time_allocation":"10 hours","confidence_booster":true},{"priority_area":"Sales Strategy","specific_topics":["Solution Selling","Consultative Selling"],"time_allocation":"5 hours","confidence_booster":true}]},"sales_engineering_signals":{"role_composition":{"confidence":0.85,"ae_se_ratio":"1:1","remote_onsite_mix":"remote","travel_percentage":0,"presales_team_size":"medium","demo_poc_percentage":40,"enablement_percentage":0,"architecture_percentage":30,"customer_interaction_percentage":30},"enablement_tooling":{"confidence":0.7,"tool_ownership":{"demo_automation":true,"internal_portals":false,"integration_tools":true,"playbook_creation":true},"content_creation":{"code_samples":true,"video_tutorials":false,"technical_whitepapers":true,"presentation_templates":true},"collaboration_scope":{"rnd_team":false,"product_team":true,"marketing_team":true,"customer_success":true},"training_responsibilities":{"internal_design":true,"internal_delivery":false,"partner_enablement":false,"customer_enablement":true}},"demo_poc_environment":{"confidence":0.8,"demo_count":{"demo_types":["Technical Demos","Proof of Concepts"],"built_vs_maintained":"built"},"tech_stack":["Cloud Warehouses","Data Engineering","APIs"],"demo_tooling":["Salesforce","Custom Demo Tools"],"poc_characteristics":{"ownership_level":"high","typical_duration":"2-4 weeks","customer_count_avg":5,"success_criteria_defined":true},"complexity_indicators":{"multi_region":false,"data_integration":true,"custom_development":true,"regulatory_requirements":false}},"success_metrics_career":{"confidence":0.8,"kpis_mentioned":["Customer Satisfaction","Sales Growth","Technical Adoption"],"success_ownership":{"team_metrics":true,"individual_metrics":true,"revenue_attribution":true},"career_progression":{"growth_signals":true,"promotion_path":["Senior Solutions Engineer","Sales Manager"],"leadership_opportunities":true},"technical_expectations":{"soft_skills_emphasis":["Communication","Problem Solving"],"tech_stack_preferences":["Cloud Technologies","Data Solutions"],"certification_requirements":[]}},"methodology_deal_context":{"confidence":0.75,"role_in_cycle":["Technical Discovery","Solution Presentation","Closing Support"],"sales_framework":["Solution Selling","Consultative Selling"],"customer_profile":{"target_verticals":["Marketing","E-commerce","SaaS"],"customer_size_focus":"enterprise","strategic_logos_mentioned":true},"deal_characteristics":{"deal_complexity":"medium","cycle_length_avg":"3-6 months","typical_acv_band":"$100k-$500k"},"competitive_landscape":{"direct_competitors_mentioned":["Segment","Snowflake"],"competitive_positioning_focus":true}}}}'::jsonb,
  NULL,
  90,
  'Proven track record in executing PoCs and consultative selling in technical environments, with strong skills in API integrations and data solutions.',
  '{"benefits":["equity compensation","remote work","flexible working hours"],"comp_max":220000,"comp_min":190000,"industry":"Martech/Data Solutions","tech_stack":["Cloud Warehouses","Data Engineering","Data Analytics","Data Modeling","APIs"],"company_size":"medium","requirements":["4+ years sales experience with at least 2+ years in enterprise companies","Strong discovery and interpersonal skills","Intellectual curiosity, high ambition and humility","Experience selling Martech and/or Data Solutions"],"comp_currency":"USD","remote_policy":"remote","skills_sought":[{"type":"experience","level":"4+ years","skill":"sales experience"},{"type":"skill","level":"strong","skill":"discovery skills"},{"type":"skill","level":"strong","skill":"interpersonal skills"},{"type":"experience","level":"preferred","skill":"Martech and/or Data Solutions"},{"type":"experience","level":"bonus","skill":"Customer Data Platforms"}],"travel_required":"0-25%","requires_clearance":false,"experience_years_max":null,"experience_years_min":4}'::jsonb,
  0,
  NULL,
  'req_580bc8c7-316a-4f35-9b18-7256aeb74749',
  '2025-08-02T06:52:10.459+00:00',
  '2025-08-02T06:52:10.459+00:00',
  'Joseph''s strengths in technical discovery, consultative selling, and API integrations align well with the role''s requirements for problem-solving and technical communication. However, the emphasis on enterprise sales and potential travel may be concerns.',
  ARRAY['Technical discovery', 'API integrations', 'Consultative selling'],
  ARRAY['Potential for enterprise politics', 'Unclear success criteria'],
  ARRAY['The role requires strong communication skills to distill technical concepts for non-technical stakeholders, which aligns with Joseph''s strengths.', 'The company values a growth mindset and compassion, which may resonate with Joseph''s approach to teamwork.', 'The focus on customer data strategy and architecture is a good match for Joseph''s technical background.'],
  '[{"type":"experience","level":"4+ years","skill":"sales experience"},{"type":"skill","level":"strong","skill":"discovery skills"},{"type":"skill","level":"strong","skill":"interpersonal skills"},{"type":"experience","level":"preferred","skill":"Martech and/or Data Solutions"},{"type":"experience","level":"bonus","skill":"Customer Data Platforms"}]'::jsonb,
  '2025-08-02T06:52:10.46156+00:00',
  '2025-08-02T06:52:10.46156+00:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (job_id) DO NOTHING;

-- ====================
-- 4. CREATE DEMO STATISTICS VIEW
-- ====================

CREATE OR REPLACE VIEW demo_stats AS
SELECT 
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN j.ai_fit_score >= 80 THEN 1 END) as excellent_matches,
  COUNT(CASE WHEN j.ai_fit_score >= 60 AND j.ai_fit_score < 80 THEN 1 END) as good_matches,
  COUNT(CASE WHEN j.ai_fit_score < 60 THEN 1 END) as poor_matches,
  AVG(j.ai_fit_score) as avg_fit_score,
  COUNT(DISTINCT j.company) as unique_companies,
  COUNT(CASE WHEN je.sales_engineering_signals IS NOT NULL THEN 1 END) as jobs_with_se_signals,
  COUNT(CASE WHEN je.interview_intelligence IS NOT NULL THEN 1 END) as jobs_with_interview_prep,
  COUNT(CASE WHEN je.quick_wins IS NOT NULL THEN 1 END) as jobs_with_quick_wins
FROM jobs j
LEFT JOIN job_enrichments je ON j.id = je.job_id
WHERE j.owner_type = 'demo';

COMMIT;

-- ===================================================================
-- ENRICHED DEMO DATA COMPLETE
-- 
-- Restored 10 jobs with complete V3 enrichment data including:
-- - Sales Engineering Signals (role composition, demo environment)
-- - Interview Intelligence (stages, technical assessments)
-- - Quick Wins (positioning, demo suggestions)
-- - All original enrichment fields
-- ===================================================================
