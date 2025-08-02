# Edge Functions Deployment Configuration

## Environment Variables

### Required Variables (All Functions)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Environment
NODE_ENV=production
```

### Optional Configuration Variables
```bash
# OpenAI Configuration
OPENAI_MAX_TOKENS=4000
OPENAI_TIMEOUT_MS=30000

# Feature Flags
DEBUG_ENABLED=false
PERFORMANCE_TRACKING=true
VERBOSE_LOGGING=false

# Rate Limiting (if using custom limits)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Supabase Configuration

### Setting Environment Variables
```bash
# Using Supabase CLI
supabase secrets set OPENAI_API_KEY=your-key
supabase secrets set NODE_ENV=production

# List current secrets
supabase secrets list
```

### Function-Specific Configuration
```bash
# For individual functions, create .env files in function directories
# supabase/functions/function-name/.env
DEBUG_ENABLED=false
CUSTOM_SETTING=value
```

## Vercel Configuration

### Environment Variables Setup
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add the following variables:

```bash
# Production Environment
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
```

### Vercel Configuration File (vercel.json)
```json
{
  "functions": {
    "supabase/functions/*/index.ts": {
      "runtime": "edge",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Security Checklist

### ✅ Pre-Deployment Security Review
- [ ] All environment variables are properly configured
- [ ] Debug endpoints are disabled in production (`NODE_ENV=production`)
- [ ] API keys are stored securely (not in code)
- [ ] Rate limiting is configured appropriately
- [ ] Input validation is enabled on all endpoints
- [ ] Error messages don't expose sensitive information
- [ ] CORS policies are properly configured
- [ ] Authentication is required where needed

### ✅ Post-Deployment Verification
- [ ] Test all endpoints with production configuration
- [ ] Verify rate limiting is working
- [ ] Check that debug endpoints return 403 in production
- [ ] Confirm logging is working but not verbose
- [ ] Test error handling and response sanitization
- [ ] Verify external API calls (OpenAI) are working
- [ ] Check database connectivity and permissions

## Performance Optimization

### Bundle Size Optimization
```bash
# Check bundle sizes
deno bundle supabase/functions/extract-job-facts/index.ts --check

# Optimize imports - only import what you need
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
# Instead of importing the entire module
```

### Cold Start Optimization
- Keep dependencies minimal
- Use efficient data structures
- Implement proper caching strategies
- Consider connection pooling for database operations

### Memory Management
```bash
# Monitor memory usage
deno run --allow-all --v8-flags=--max-old-space-size=512 your-function.ts
```

## Monitoring and Observability

### Logging Configuration
```typescript
// Production logging configuration
const logger = createLogger('function-name', {
  level: 'info', // Reduce verbosity in production
  correlation_id: correlationId,
  environment: 'production'
})
```

### Health Check Endpoints
All functions should support health checks:
```bash
# Test health endpoint
curl -X GET https://your-function-url/health
```

### Metrics to Monitor
- Request latency (p50, p95, p99)
- Error rates by function
- Rate limit violations
- External API call latency (OpenAI)
- Database query performance
- Memory usage
- Cold start frequency

## Deployment Scripts

### Supabase Deployment
```bash
#!/bin/bash
# deploy-supabase.sh

echo "Deploying Supabase Edge Functions..."

# Deploy all functions
supabase functions deploy extract-job-facts
supabase functions deploy analyze-job-personal
supabase functions deploy debug-env
supabase functions deploy test-function

# Verify deployments
echo "Verifying deployments..."
supabase functions list

echo "Deployment complete!"
```

### Vercel Deployment
```bash
#!/bin/bash
# deploy-vercel.sh

echo "Deploying to Vercel..."

# Deploy to production
vercel --prod

# Verify deployment
vercel ls

echo "Deployment complete!"
```

## Testing in Production

### Smoke Tests
```bash
#!/bin/bash
# smoke-tests.sh

BASE_URL="https://your-function-url"

echo "Running smoke tests..."

# Test health endpoint
curl -f "${BASE_URL}/test-function" || exit 1

# Test rate limiting
for i in {1..5}; do
  curl -f "${BASE_URL}/debug-env" -H "Authorization: Bearer test"
done

echo "Smoke tests passed!"
```

### Load Testing
```bash
# Using Artillery.js
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'https://your-function-url'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Job extraction"
    requests:
      - post:
          url: "/extract-job-facts"
          json:
            jobId: "test-job-123"
            enrichmentId: "test-enrichment-456"
            correlationId: "test-correlation-789"
            workerId: "test-worker"
            jobData:
              id: "test-job-123"
              title: "Software Engineer"
              company: "Test Company"
              description: "Test job description"
EOF

# Run load test
artillery run load-test.yml
```

## Rollback Strategy

### Supabase Rollback
```bash
# List function versions
supabase functions list --with-versions

# Rollback to previous version
supabase functions deploy function-name --version previous-version-id
```

### Vercel Rollback
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback deployment-url
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   - Check variable names match exactly
   - Verify variables are set in correct environment
   - Restart function after setting variables

2. **Rate Limiting Issues**
   - Check rate limit configuration
   - Verify client IP detection
   - Monitor rate limit metrics

3. **Cold Start Performance**
   - Optimize bundle size
   - Reduce dependency count
   - Implement connection pooling

4. **External API Timeouts**
   - Check timeout configuration
   - Verify network connectivity
   - Monitor external service status

### Debug Commands
```bash
# Check function logs
supabase functions logs function-name

# Test function locally
supabase functions serve function-name

# Verify environment variables
supabase secrets list
```

## Maintenance

### Regular Tasks
- [ ] Monitor error rates and performance metrics
- [ ] Review and rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Review rate limit settings based on usage
- [ ] Check for new security vulnerabilities
- [ ] Update documentation as needed

### Dependency Updates
```bash
# Check for outdated dependencies
deno info --json | jq '.modules[].specifier' | grep -E 'std@|supabase-js@'

# Update to latest versions
# Update imports in shared utilities
``` 