import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

execSync('npx jest --json --outputFile=test-results.json 2>&1 || true', {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
});

const raw = fs.readFileSync(path.resolve(__dirname, '../test-results.json'), 'utf-8');
const report = JSON.parse(raw);

const summary = {
  timestamp: new Date().toISOString(),
  total: report.numTotalTests,
  passed: report.numPassedTests,
  failed: report.numFailedTests,
  pending: report.numPendingTests,
  suites: (report.testResults ?? []).map((suite: any) => ({
    name: suite.testFilePath.split('/').pop(),
    tests: (suite.testResults ?? []).map((t: any) => ({
      name: t.fullName,
      status: t.status,
      duration: t.duration,
      error: t.failureMessages?.[0] || null,
    })),
  })),
};

fs.writeFileSync(path.resolve(__dirname, '../test-report.json'), JSON.stringify(summary, null, 2));
console.log(`\nTest report written to test-report.json`);
console.log(`Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Pending: ${summary.pending}`);
