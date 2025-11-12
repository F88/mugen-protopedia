/**
 * Types for image QA tool
 */

export interface ImageStats {
  path: string;
  width: number;
  height: number;
  channels: number;
  hasAlpha: boolean;
  brightness: {
    mean: number;
    min: number;
    max: number;
  };
  contrast: {
    variance: number;
    stdDev: number;
  };
  alpha?: {
    mean: number;
    fullyTransparent: boolean;
    highTransparency: boolean;
  };
}

export interface ValidationResult {
  path: string;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ImageStats;
}

export interface ValidationError {
  type: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: string;
  message: string;
}

export interface ThresholdConfig {
  brightness?: {
    min?: number;
    max?: number;
    mean?: { min?: number; max?: number };
  };
  contrast?: {
    minVariance?: number;
    minStdDev?: number;
  };
  alpha?: {
    maxMeanTransparency?: number;
    allowFullyTransparent?: boolean;
  };
  dimensions?: {
    expected?: { width: number; height: number };
    pattern?: string; // regex to extract expected dimensions from filename
  };
}

export interface QAConfig {
  include: string[];
  exclude?: string[];
  thresholds: ThresholdConfig;
  severity: 'error' | 'warning';
}

export interface Preset {
  name: string;
  description: string;
  config: QAConfig;
}

export interface QAReport {
  timestamp: string;
  totalImages: number;
  passed: number;
  failed: number;
  results: ValidationResult[];
  summary: {
    errors: number;
    warnings: number;
  };
}
