import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { isAbsolute } from 'path';
import { processImage } from './analyzer.js';
import { presets } from './presets.js';
import type { QAConfig, QAReport, ValidationResult } from './types.js';

/**
 * Load configuration from file
 */
export async function loadConfig(configPath: string): Promise<QAConfig> {
  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to load config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get preset configuration
 */
export function getPreset(presetName: string): QAConfig {
  const preset = presets[presetName];
  if (!preset) {
    throw new Error(
      `Unknown preset: ${presetName}. Available: ${Object.keys(presets).join(', ')}`,
    );
  }
  return preset.config;
}

/**
 * Find images matching glob patterns
 */
export async function findImages(
  include: string[],
  exclude: string[] = [],
): Promise<string[]> {
  const includePatterns = normalizeGlobPatterns(include);
  const excludePatterns = normalizeGlobPatterns(exclude);

  const images = await glob(includePatterns, {
    ignore: excludePatterns,
    nodir: true,
  });

  return images;
}

function normalizeGlobPatterns(patterns: string[]): string[] {
  return patterns.map((pattern) => {
    if (!pattern) {
      return pattern;
    }

    if (isAbsolute(pattern)) {
      return pattern;
    }

    if (pattern.startsWith('./') || pattern.startsWith('../')) {
      return pattern;
    }

    if (
      pattern.startsWith('**/') ||
      pattern.includes('/') ||
      hasGlobSyntax(pattern)
    ) {
      return pattern;
    }

    return `**/${pattern}`;
  });
}

function hasGlobSyntax(pattern: string): boolean {
  const globTokens = ['*', '?', '[', ']', '{', '}', '(', ')', '!'];
  return globTokens.some((token) => pattern.includes(token));
}

/**
 * Run QA validation on images
 */
export async function runQA(config: QAConfig): Promise<QAReport> {
  const images = await findImages(config.include, config.exclude);

  if (images.length === 0) {
    console.warn('No images found matching the specified patterns');
  }

  const results: ValidationResult[] = [];

  for (const imagePath of images) {
    const result = await processImage(imagePath, config.thresholds);
    results.push(result);
  }

  const passed = results.filter((r) => r.valid).length;
  const failed = results.length - passed;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  return {
    timestamp: new Date().toISOString(),
    totalImages: images.length,
    passed,
    failed,
    results,
    summary: {
      errors: totalErrors,
      warnings: totalWarnings,
    },
  };
}
