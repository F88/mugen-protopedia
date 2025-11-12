import type { QAReport } from './types.js';

/**
 * Format report as human-readable text
 */
export function formatTextReport(report: QAReport): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════');
  lines.push('  IMAGE QA REPORT');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push(`Total Images: ${report.totalImages}`);
  lines.push(`Passed: ${report.passed} ✓`);
  lines.push(`Failed: ${report.failed} ✗`);
  lines.push(`Errors: ${report.summary.errors}`);
  lines.push(`Warnings: ${report.summary.warnings}`);
  lines.push('');

  // Group results by status
  const failedResults = report.results.filter((r) => !r.valid);
  const passedResults = report.results.filter((r) => r.valid);

  if (failedResults.length > 0) {
    lines.push('───────────────────────────────────────────────────────');
    lines.push('FAILED IMAGES:');
    lines.push('───────────────────────────────────────────────────────');

    for (const result of failedResults) {
      lines.push('');
      lines.push(`✗ ${result.path}`);
      lines.push(`  Dimensions: ${result.stats.width}x${result.stats.height}`);
      lines.push(
        `  Brightness: ${result.stats.brightness.mean.toFixed(3)} (min: ${result.stats.brightness.min.toFixed(3)}, max: ${result.stats.brightness.max.toFixed(3)})`,
      );
      lines.push(
        `  Contrast: variance=${result.stats.contrast.variance.toFixed(4)}, stdDev=${result.stats.contrast.stdDev.toFixed(4)}`,
      );

      if (result.stats.alpha) {
        lines.push(
          `  Transparency: ${(result.stats.alpha.mean * 100).toFixed(1)}%`,
        );
      }

      if (result.errors.length > 0) {
        lines.push('  Errors:');
        for (const error of result.errors) {
          lines.push(`    • ${error.message}`);
        }
      }

      if (result.warnings.length > 0) {
        lines.push('  Warnings:');
        for (const warning of result.warnings) {
          lines.push(`    • ${warning.message}`);
        }
      }
    }
  }

  if (passedResults.length > 0 && report.summary.warnings > 0) {
    lines.push('');
    lines.push('───────────────────────────────────────────────────────');
    lines.push('PASSED WITH WARNINGS:');
    lines.push('───────────────────────────────────────────────────────');

    for (const result of passedResults) {
      if (result.warnings.length > 0) {
        lines.push('');
        lines.push(`✓ ${result.path}`);
        lines.push('  Warnings:');
        for (const warning of result.warnings) {
          lines.push(`    • ${warning.message}`);
        }
      }
    }
  }

  if (failedResults.length === 0) {
    lines.push('');
    lines.push('───────────────────────────────────────────────────────');
    lines.push('All images passed validation! ✓');
    lines.push('───────────────────────────────────────────────────────');
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Format report as JSON
 */
export function formatJsonReport(report: QAReport): string {
  return JSON.stringify(report, null, 2);
}
