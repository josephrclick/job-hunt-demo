-- ===================================================================
-- ENRICH DEMO JOBS WITH COMPREHENSIVE DATA
-- 
-- Updates all demo jobs with detailed enrichment data including:
-- - Requirements, skills_sought, tech_stack in extracted_fields
-- - Enhanced insights, fit_reasoning, key_strengths, and concerns
-- - Skills analysis with skills_you_have and skills_to_develop
-- ===================================================================

BEGIN;

-- Update Atlassian - Senior Solutions Engineer, Enterprise
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'Atlassian tools are used by 100M+ developers worldwide',
    'Company culture prioritizes developer happiness and productivity',
    'Remote-first with asynchronous collaboration',
    'Strong emphasis on building solutions that scale globally'
  ],
  fit_reasoning = 'Excellent opportunity for someone passionate about enterprise solutions and developer tools. Atlassian''s mission to improve team collaboration aligns with building impactful solutions. Great for engineers who want to work with customers and solve complex business problems.',
  key_strengths = ARRAY[
    'Industry leader in collaboration and developer tools',
    'Strong engineering culture with focus on quality',
    'Competitive compensation and benefits',
    'Global impact on developer and business teams',
    'Customer-facing role with high impact'
  ],
  concerns = ARRAY[
    'Large organization may have slower decision-making',
    'High expectations for solution architecture and customer focus'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '8+ years of software engineering experience',
      'Strong experience with enterprise solutions',
      'Experience with pre-sales and solution architecture',
      'Excellent communication and presentation skills',
      'Track record of customer-facing technical roles'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'solution architecture', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'enterprise software', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'pre-sales engineering', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'technical communication', 'type', 'soft', 'level', 'expert'),
      json_build_object('skill', 'customer engagement', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['Java', 'Spring', 'JavaScript', 'AWS', 'Docker', 'Kubernetes'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'Solution Architecture', 'importance', 'Critical'),
        json_build_object('skill', 'Enterprise Software', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'Atlassian' AND owner_type = 'demo');

-- Update Clari - Senior Sales Engineer
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'Clari is the leader in Revenue Operations and Intelligence',
    'Company serves 1000+ customers and processes $4 trillion in pipeline',
    'Strong growth trajectory with significant enterprise adoption',
    'Focus on AI-powered revenue insights and forecasting'
  ],
  fit_reasoning = 'Outstanding opportunity to work on revenue-critical systems that directly impact business outcomes. Clari''s focus on AI and ML for revenue intelligence offers cutting-edge technical challenges. Perfect for engineers who want to build systems that help businesses optimize their revenue operations.',
  key_strengths = ARRAY[
    'Market leader in Revenue Operations',
    'AI-powered platform with strong technical challenges',
    'Well-funded with strong growth prospects',
    'Direct impact on customer revenue outcomes',
    'Collaborative sales engineering role'
  ],
  concerns = ARRAY[
    'High-pressure environment dealing with revenue systems',
    'Need to understand complex sales processes',
    'Customer-facing role requires strong communication'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '5+ years technical sales or sales engineering experience',
      'Strong background in SaaS and enterprise software',
      'Experience with revenue operations or CRM systems',
      'Excellent presentation and communication skills',
      'Understanding of sales processes and methodologies'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'sales engineering', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'SaaS platforms', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'revenue operations', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'technical presentations', 'type', 'soft', 'level', 'expert'),
      json_build_object('skill', 'customer relationship management', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['Salesforce', 'APIs', 'JavaScript', 'Python', 'SQL', 'AWS'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'Sales Engineering', 'importance', 'Critical'),
        json_build_object('skill', 'Revenue Operations', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'Clari' AND owner_type = 'demo');

-- Update ServiceNow - Senior Technical Accelerator Consultant - Impact
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'ServiceNow is the leader in digital workflow transformation',
    'Platform serves 80%+ of Fortune 500 companies',
    'Strong focus on customer success and digital transformation',
    'Opportunity to work with enterprise customers on critical implementations'
  ],
  fit_reasoning = 'Exceptional opportunity to drive digital transformation at enterprise scale. ServiceNow''s platform approach to workflow automation offers complex technical challenges. Perfect for consultants who want to help large organizations modernize their operations and processes.',
  key_strengths = ARRAY[
    'Market leader in digital workflows and automation',
    'Strong customer success focus',
    'Enterprise-scale implementations',
    'Comprehensive training and development',
    'High-impact consulting role'
  ],
  concerns = ARRAY[
    'Travel requirements for customer engagements',
    'Complex enterprise implementations can be challenging',
    'Need to understand diverse business processes'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '5+ years technical consulting or implementation experience',
      'Strong background in enterprise software platforms',
      'Experience with workflow automation or process improvement',
      'Excellent client-facing and communication skills',
      'ServiceNow certification preferred'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'technical consulting', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'workflow automation', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'enterprise platforms', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'client management', 'type', 'soft', 'level', 'expert'),
      json_build_object('skill', 'process improvement', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['ServiceNow', 'JavaScript', 'REST APIs', 'XML', 'SQL', 'ITIL'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'ServiceNow Platform', 'importance', 'Critical'),
        json_build_object('skill', 'Technical Consulting', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'ServiceNow' AND owner_type = 'demo');

-- Update Sophos - Senior Sales Engineer - (West Coast)
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'Sophos is a leader in next-generation cybersecurity',
    'Protects over 500,000 organizations worldwide',
    'Strong focus on AI-powered threat detection and response',
    'Growing demand for cybersecurity solutions across all industries'
  ],
  fit_reasoning = 'Critical opportunity to work in the fast-growing cybersecurity market. Sophos'' focus on AI-powered security solutions offers cutting-edge technical challenges. Perfect for engineers who want to help organizations defend against evolving cyber threats.',
  key_strengths = ARRAY[
    'Leader in next-generation cybersecurity',
    'AI-powered security technologies',
    'Strong market demand and growth',
    'Mission-critical work protecting organizations',
    'Technical sales role with high impact'
  ],
  concerns = ARRAY[
    'High-pressure environment dealing with security threats',
    'Complex technical products requiring deep expertise',
    'Competitive cybersecurity market'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '5+ years technical sales or cybersecurity experience',
      'Strong background in network security and endpoint protection',
      'Experience with security incident response',
      'Excellent technical presentation skills',
      'Security certifications preferred (CISSP, SANS, etc.)'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'cybersecurity', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'network security', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'incident response', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'technical sales', 'type', 'soft', 'level', 'expert'),
      json_build_object('skill', 'security consulting', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['Sophos XG', 'Intercept X', 'EDR', 'SIEM', 'APIs', 'PowerShell'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'Cybersecurity', 'importance', 'Critical'),
        json_build_object('skill', 'Security Sales', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'Sophos' AND owner_type = 'demo');

-- Update Vercel - Partner Solutions Engineer
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'Vercel is the leader in frontend development and deployment',
    'Powers websites for millions of developers and major companies',
    'Strong growth in the Next.js and React ecosystem',
    'Focus on developer experience and performance optimization'
  ],
  fit_reasoning = 'Outstanding opportunity to work with cutting-edge frontend technologies and developer tools. Vercel''s focus on developer experience and performance offers unique technical challenges. Perfect for engineers passionate about Next.js, React, and modern web development.',
  key_strengths = ARRAY[
    'Leader in modern frontend development',
    'Strong developer community and ecosystem',
    'Cutting-edge technology stack',
    'High-growth company with strong funding',
    'Focus on developer experience and partnerships'
  ],
  concerns = ARRAY[
    'Competitive frontend/developer tools market',
    'Need to stay current with rapidly evolving web technologies',
    'Partner-facing role requires strong relationship skills'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '5+ years frontend development or developer relations experience',
      'Strong expertise in Next.js, React, and modern web technologies',
      'Experience with partnerships or developer advocacy',
      'Excellent communication and presentation skills',
      'Understanding of developer tools and workflows'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'Next.js/React', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'developer relations', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'partnership development', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'technical advocacy', 'type', 'soft', 'level', 'expert'),
      json_build_object('skill', 'community building', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['Next.js', 'React', 'TypeScript', 'Vercel', 'Node.js', 'Edge Functions'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'Next.js', 'importance', 'Critical'),
        json_build_object('skill', 'Developer Relations', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'Vercel' AND owner_type = 'demo' AND title = 'Partner Solutions Engineer');

-- Update Recorded Future - Senior Sales Engineer, West
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'Recorded Future is a leader in threat intelligence',
    'Serves government agencies and Fortune 500 companies',
    'AI-powered threat intelligence and security analytics',
    'Critical role in helping organizations understand cyber threats'
  ],
  fit_reasoning = 'Strategic opportunity to work in threat intelligence and cybersecurity. Recorded Future''s AI-powered approach to threat detection offers complex technical challenges. Great for engineers who want to help organizations proactively defend against cyber threats.',
  key_strengths = ARRAY[
    'Leader in threat intelligence and security analytics',
    'AI-powered security technologies',
    'Government and enterprise customer base',
    'Mission-critical cybersecurity work',
    'Strong technical sales role'
  ],
  concerns = ARRAY[
    'Complex threat intelligence domain',
    'High-security clearance may be required',
    'Competitive cybersecurity market'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '5+ years cybersecurity or threat intelligence experience',
      'Strong background in security analytics and threat hunting',
      'Experience with technical sales or consulting',
      'Understanding of threat intelligence frameworks',
      'Security clearance preferred'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'threat intelligence', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'security analytics', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'threat hunting', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'technical sales', 'type', 'soft', 'level', 'expert'),
      json_build_object('skill', 'security consulting', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['Recorded Future', 'SIEM', 'SOAR', 'APIs', 'Python', 'Threat Intelligence'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'Threat Intelligence', 'importance', 'Critical'),
        json_build_object('skill', 'Security Analytics', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'Recorded Future' AND owner_type = 'demo');

-- Update Jobright.ai - Mid-Level Pre-Sales Engineer (Remote)
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'Jobright.ai is building AI-powered job matching and career tools',
    'Growing startup in the HR tech and AI space',
    'Remote-first company with flexible working arrangements',
    'Opportunity to shape product direction in early-stage startup'
  ],
  fit_reasoning = 'Exciting opportunity to work on AI-powered HR technology at an early-stage startup. Great for engineers who want to work on machine learning applications while building their pre-sales skills. The remote-first culture offers flexibility and growth potential.',
  key_strengths = ARRAY[
    'AI-powered HR technology with growth potential',
    'Early-stage startup with equity opportunity',
    'Remote-first with flexible work arrangements',
    'Opportunity to wear multiple hats and learn',
    'Growing market in AI and HR tech'
  ],
  concerns = ARRAY[
    'Startup risk and limited resources',
    'Pre-sales role requires strong communication skills',
    'Need to balance technical and sales responsibilities'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '3-5 years technical or pre-sales experience',
      'Interest in AI and machine learning applications',
      'Strong communication and presentation skills',
      'Understanding of HR technology or recruiting',
      'Startup experience preferred'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'pre-sales engineering', 'type', 'technical', 'level', 'intermediate'),
      json_build_object('skill', 'AI/ML applications', 'type', 'technical', 'level', 'learning'),
      json_build_object('skill', 'HR technology', 'type', 'technical', 'level', 'learning'),
      json_build_object('skill', 'technical presentations', 'type', 'soft', 'level', 'strong'),
      json_build_object('skill', 'startup adaptability', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['Python', 'AI/ML', 'APIs', 'SaaS platforms', 'CRM systems'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'Pre-Sales Engineering', 'importance', 'Critical'),
        json_build_object('skill', 'AI/ML Applications', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'Jobright.ai' AND owner_type = 'demo');

-- Update Motive - Senior Sales Engineer, Strategic
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'Motive is the leader in fleet management and IoT solutions',
    'Serves 120,000+ customers across transportation and logistics',
    'Strong growth in connected vehicle and fleet optimization',
    'Focus on strategic enterprise accounts and complex deployments'
  ],
  fit_reasoning = 'Strategic opportunity to work with enterprise fleet management and IoT technologies. Motive''s focus on connected vehicles and logistics optimization offers unique technical challenges. Perfect for engineers interested in IoT, data analytics, and enterprise sales.',
  key_strengths = ARRAY[
    'Market leader in fleet management and IoT',
    'Large customer base with strong retention',
    'Growing market in connected vehicles',
    'Strategic enterprise sales role',
    'Complex technical solutions and integrations'
  ],
  concerns = ARRAY[
    'Complex enterprise sales cycles',
    'Need to understand fleet operations and logistics',
    'Competitive market with established players'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '5+ years enterprise sales engineering experience',
      'Strong background in IoT or fleet management solutions',
      'Experience with strategic account management',
      'Understanding of transportation and logistics',
      'Excellent presentation and negotiation skills'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'enterprise sales engineering', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'IoT solutions', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'fleet management', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'strategic account management', 'type', 'soft', 'level', 'expert'),
      json_build_object('skill', 'complex solution selling', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['IoT platforms', 'Fleet APIs', 'Data analytics', 'Mobile apps', 'GPS tracking'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'IoT Solutions', 'importance', 'Critical'),
        json_build_object('skill', 'Enterprise Sales', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'Motive' AND owner_type = 'demo');

-- Update Pendo.io - Sr. Sales Engineer
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'Pendo is the leader in product experience and analytics',
    'Serves 2000+ customers including major enterprise companies',
    'Strong focus on product-led growth and user experience',
    'Growing market in product analytics and user insights'
  ],
  fit_reasoning = 'Excellent opportunity to work with product analytics and user experience technologies. Pendo''s focus on product-led growth offers interesting technical challenges. Great for engineers who want to help companies understand and optimize their product experiences.',
  key_strengths = ARRAY[
    'Leader in product experience and analytics',
    'Strong customer base and growth',
    'Focus on product-led growth strategies',
    'Technical sales role with product focus',
    'Growing market in product analytics'
  ],
  concerns = ARRAY[
    'Competitive market in product analytics',
    'Need to understand product management and UX',
    'Technical sales role requires strong communication'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '5+ years technical sales or product experience',
      'Strong background in product analytics or UX',
      'Experience with SaaS and enterprise software',
      'Understanding of product management principles',
      'Excellent presentation and demo skills'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'product analytics', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'technical sales', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'user experience', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'product demonstrations', 'type', 'soft', 'level', 'expert'),
      json_build_object('skill', 'customer success', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['Pendo', 'Product analytics', 'JavaScript', 'APIs', 'SaaS platforms'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'Product Analytics', 'importance', 'Critical'),
        json_build_object('skill', 'Technical Sales', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'Pendo.io' AND owner_type = 'demo');

-- Update Vercel - Head of Product Marketing (the second Vercel job)
UPDATE job_enrichments
SET 
  insights = ARRAY[
    'Vercel is rapidly growing in the developer tools market',
    'Strong brand recognition in the Next.js and React community',
    'Focus on developer experience and marketing to technical audiences',
    'Opportunity to shape product positioning for cutting-edge frontend tech'
  ],
  fit_reasoning = 'Strategic leadership opportunity in product marketing for developer tools. Vercel''s position in the frontend ecosystem offers unique challenges in technical marketing. Great for experienced marketers who understand developers and want to drive product strategy.',
  key_strengths = ARRAY[
    'Leadership role in fast-growing company',
    'Strong developer community and brand',
    'Cutting-edge technology positioning',
    'Opportunity to shape marketing strategy',
    'Well-funded with strong growth trajectory'
  ],
  concerns = ARRAY[
    'Requires deep understanding of developer audience',
    'Competitive developer tools market',
    'Need to balance technical depth with marketing goals'
  ],
  extracted_fields = COALESCE(extracted_fields, '{}'::jsonb) || jsonb_build_object(
    'requirements', ARRAY[
      '8+ years product marketing experience',
      'Strong background in developer tools or technical products',
      'Experience marketing to developer audiences',
      'Leadership experience building marketing teams',
      'Understanding of modern web development ecosystem'
    ],
    'skills_sought', json_build_array(
      json_build_object('skill', 'product marketing', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'developer marketing', 'type', 'technical', 'level', 'expert'),
      json_build_object('skill', 'technical positioning', 'type', 'technical', 'level', 'strong'),
      json_build_object('skill', 'marketing leadership', 'type', 'soft', 'level', 'expert'),
      json_build_object('skill', 'strategic planning', 'type', 'soft', 'level', 'experienced')
    )::jsonb,
    'tech_stack', ARRAY['Next.js', 'React', 'Developer tools', 'Marketing platforms', 'Analytics'],
    'skills_analysis', jsonb_build_object(
      'skills_you_have', json_build_array(
        json_build_object('skill', 'JavaScript', 'proficiency', 'Expert'),
        json_build_object('skill', 'React', 'proficiency', 'Strong'),
        json_build_object('skill', 'Node.js', 'proficiency', 'Strong'),
        json_build_object('skill', 'Python', 'proficiency', 'Intermediate')
      )::jsonb,
      'skills_to_develop', json_build_array(
        json_build_object('skill', 'Product Marketing', 'importance', 'Critical'),
        json_build_object('skill', 'Developer Relations', 'importance', 'High')
      )::jsonb
    )
  )
WHERE job_id = (SELECT id FROM jobs WHERE company = 'Vercel' AND owner_type = 'demo' AND title = 'Head of Product Marketing');

COMMIT;

-- ===================================================================
-- ENRICHMENT COMPLETE
-- 
-- All 10 demo jobs now have comprehensive enrichment data including:
-- - Requirements and skills analysis in extracted_fields
-- - Enhanced insights, fit reasoning, and key strengths
-- - Skills to develop based on each company's needs
-- ===================================================================