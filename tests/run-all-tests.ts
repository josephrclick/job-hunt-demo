/**
 * Comprehensive Test Runner for Enrichment Pipeline
 * 
 * This script runs all test suites and generates a comprehensive report
 * including unit tests, integration tests, performance benchmarks, and A/B testing validation.
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { PipelineMonitor } from './performance/monitoring-setup';

interface TestSuite {
  name: string;
  pattern: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
}

const TEST_SUITES: TestSuite[] = [
  // Unit Tests
  {
    name: 'FORECAST Prompts',
    pattern: 'tests/unit/prompts/forecast-prompts.test.ts',
    type: 'unit'
  },
  {
    name: 'Risk Detection',
    pattern: 'tests/unit/risk-detection/implicit-patterns.test.ts',
    type: 'unit'
  },
  {
    name: 'Response Validation',
    pattern: 'tests/unit/response-parser/validation-schemas.test.ts',
    type: 'unit'
  },
  {
    name: 'A/B Testing Framework',
    pattern: 'tests/unit/ab-testing/enrichment-experiments.test.ts',
    type: 'unit'
  },
  {
    name: 'Rollout Controls',
    pattern: 'tests/unit/ab-testing/rollout-controls.test.ts',
    type: 'unit'
  },
  // Integration Tests
  {
    name: 'Enrichment Pipeline Integration',
    pattern: 'tests/integration/enrichment-pipeline.test.ts',
    type: 'integration'
  },
  // E2E Tests
  {
    name: 'End-to-End Pipeline',
    pattern: 'tests/e2e/enrichment-pipeline-e2e.test.ts',
    type: 'e2e'
  },
  // Performance Tests
  {
    name: 'Performance Benchmarks',
    pattern: 'tests/performance/enrichment-benchmarks.test.ts',
    type: 'performance'
  }
];

interface TestResult {
  suite: string;
  type: string;
  passed: boolean;
  duration: number;
  output?: string;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];
  private monitor: PipelineMonitor;

  constructor() {
    this.monitor = new PipelineMonitor();
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive Test Suite for Enrichment Pipeline\n');
    
    const startTime = Date.now();
    this.monitor.start();

    for (const suite of TEST_SUITES) {
      await this.runTestSuite(suite);
    }

    const totalDuration = Date.now() - startTime;
    
    this.generateReport(totalDuration);
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`\n📋 Running ${suite.name} (${suite.type})...`);
    
    const startTime = Date.now();
    let passed = false;
    let output = '';
    let error = '';

    try {
      output = execSync(`npx vitest run ${suite.pattern} --reporter=verbose`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      passed = true;
      console.log(`✅ ${suite.name} passed`);
    } catch (e: any) {
      error = e.stdout || e.message;
      console.log(`❌ ${suite.name} failed`);
    }

    const duration = Date.now() - startTime;

    this.results.push({
      suite: suite.name,
      type: suite.type,
      passed,
      duration,
      output,
      error
    });
  }

  private generateReport(totalDuration: number): void {
    const timestamp = new Date().toISOString();
    let report = `# Enrichment Pipeline Test Report\n\n`;
    report += `Generated: ${timestamp}\n`;
    report += `Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n\n`;

    // Summary
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = (passedTests / totalTests * 100).toFixed(1);

    report += `## Summary\n\n`;
    report += `- Total Test Suites: ${totalTests}\n`;
    report += `- Passed: ${passedTests}\n`;
    report += `- Failed: ${failedTests}\n`;
    report += `- Pass Rate: ${passRate}%\n\n`;

    // Results by Type
    const types = ['unit', 'integration', 'e2e', 'performance'];
    report += `## Results by Type\n\n`;
    
    for (const type of types) {
      const typeResults = this.results.filter(r => r.type === type);
      if (typeResults.length === 0) continue;

      const passed = typeResults.filter(r => r.passed).length;
      const total = typeResults.length;
      
      report += `### ${type.toUpperCase()} Tests\n`;
      report += `- Total: ${total}\n`;
      report += `- Passed: ${passed}\n`;
      report += `- Failed: ${total - passed}\n\n`;
    }

    // Detailed Results
    report += `## Detailed Results\n\n`;
    
    for (const result of this.results) {
      report += `### ${result.suite}\n`;
      report += `- Type: ${result.type}\n`;
      report += `- Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
      report += `- Duration: ${(result.duration / 1000).toFixed(2)}s\n`;
      
      if (!result.passed && result.error) {
        report += `\n#### Error Output:\n\`\`\`\n${result.error.slice(0, 1000)}...\n\`\`\`\n`;
      }
      
      report += '\n';
    }

    // Performance Metrics (if available)
    if (this.results.some(r => r.type === 'performance' && r.passed)) {
      report += `## Performance Metrics\n\n`;
      report += this.monitor.generateFullReport();
    }

    // Recommendations
    report += `\n## Recommendations\n\n`;
    
    if (failedTests > 0) {
      report += `⚠️  **Action Required**: ${failedTests} test suite(s) failed. Please review the error output above.\n\n`;
    }

    if (passRate < 100) {
      report += `### Failed Tests Analysis\n\n`;
      const failedSuites = this.results.filter(r => !r.passed);
      for (const suite of failedSuites) {
        report += `- **${suite.suite}**: Review ${suite.type} test implementation\n`;
      }
    } else {
      report += `✅ All tests passed! The enrichment pipeline is ready for deployment.\n`;
    }

    // Save report
    const filename = `test-report-${timestamp.split('T')[0]}.md`;
    writeFileSync(filename, report);
    console.log(`\n📄 Test report saved to: ${filename}`);

    // Print summary to console
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Test Suites: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('='.repeat(50));
  }
}

// Run tests if executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(console.error);
}

export { TestRunner };