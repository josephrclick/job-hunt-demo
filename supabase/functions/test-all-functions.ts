#!/usr/bin/env -S deno run --allow-all

/**
 * Comprehensive Edge Functions Test Suite
 * Tests all functions for security, validation, and functionality
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

interface TestResult {
  name: string
  passed: boolean
  message: string
  duration: number
  details?: unknown
}

interface TestSuite {
  name: string
  results: TestResult[]
  totalPassed: number
  totalFailed: number
  duration: number
}

class EdgeFunctionTester {
  private baseUrl: string
  private results: TestSuite[] = []

  constructor(baseUrl: string = 'http://localhost:54321/functions/v1') {
    this.baseUrl = baseUrl
  }

  async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    const start = Date.now()
    try {
      await testFn()
      return {
        name,
        passed: true,
        message: 'Test passed',
        duration: Date.now() - start
      }
    } catch (error) {
      return {
        name,
        passed: false,
        message: error instanceof Error ? error.message : String(error),
        duration: Date.now() - start,
        details: error
      }
    }
  }

  async testFunction(functionName: string, tests: Array<{ name: string, test: () => Promise<void> }>): Promise<TestSuite> {

  }

  // Security tests
  async testSecurity() {
    return this.testFunction('security', [
      {
        name: 'SQL injection protection',
        test: async () => {
          const maliciousData = {
            jobId: "'; DROP TABLE jobs; --",
            enrichmentId: 'test',
            workerId: 'test',
            jobData: {
              id: 'test',
              title: "'; SELECT * FROM users; --",
              company: 'test',
              description: 'test'
            }
          }
          
          const response = await this.makeRequest('extract-job-facts', {
            method: 'POST',
            body: JSON.stringify(maliciousData)
          })
          
          // Should either validate and reject (400) or process safely
          if (response.status !== 400 && response.status !== 200) {
            throw new Error(`Unexpected response to potential SQL injection: ${response.status}`)
          }
        }
      },
      {
        name: 'XSS protection',
        test: async () => {
          const xssData = {
            jobId: 'test',
            enrichmentId: 'test',
            workerId: 'test',
            jobData: {
              id: 'test',
              title: '<script>alert("xss")</script>',
              company: 'test',
              description: '<img src=x onerror=alert("xss")>'
            }
          }
          
          const response = await this.makeRequest('extract-job-facts', {
            method: 'POST',
            body: JSON.stringify(xssData)
          })
          
          if (response.ok) {
            const data = await response.json()
            // Check that script tags are properly handled
            const responseText = JSON.stringify(data)
            if (responseText.includes('<script>') || responseText.includes('onerror=')) {
              throw new Error('XSS content not properly sanitized')
            }
          }
        }
      }
    ])
  }

  // Performance tests
  async testPerformance() {
    return this.testFunction('performance', [
      {
        name: 'Response time under 30 seconds',
        test: async () => {
          const start = Date.now()
          const response = await this.makeRequest('test-function')
          const duration = Date.now() - start
          
          if (duration > 30000) {
            throw new Error(`Response time too slow: ${duration}ms`)
          }
          
          if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`)
          }
        }
      },
      {
        name: 'Concurrent request handling',
        test: async () => {
          const concurrentRequests = 5
          const start = Date.now()
          
          const promises = Array.from({ length: concurrentRequests }, () => 
            this.makeRequest('test-function')
          )
          
          const responses = await Promise.all(promises)
          const duration = Date.now() - start
          
          const successCount = responses.filter(r => r.ok).length
          if (successCount < concurrentRequests * 0.8) { // Allow 20% failure rate
            throw new Error(`Too many failed concurrent requests: ${successCount}/${concurrentRequests}`)
          }

} 