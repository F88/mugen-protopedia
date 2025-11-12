import sharp from 'sharp';
import type {
  ImageStats,
  ValidationResult,
  ThresholdConfig,
  ValidationError,
  ValidationWarning,
} from './types.js';

/**
 * Analyze an image and extract statistics
 */
export async function analyzeImage(imagePath: string): Promise<ImageStats> {
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  const { width = 0, height = 0, channels = 0, hasAlpha = false } = metadata;

  // Get pixel statistics
  const stats = await image.stats();

  // Calculate brightness (mean luminance across all channels)
  // Using perceived luminance formula: 0.299*R + 0.587*G + 0.114*B
  const channelStats = stats.channels;
  let brightnessMean = 0;

  if (channels >= 3) {
    // RGB or RGBA
    brightnessMean =
      (0.299 * channelStats[0].mean +
        0.587 * channelStats[1].mean +
        0.114 * channelStats[2].mean) /
      255;
  } else if (channels === 1) {
    // Grayscale
    brightnessMean = channelStats[0].mean / 255;
  }

  // Calculate overall min/max brightness
  const brightnessMin = Math.min(...channelStats.map((c) => c.min)) / 255;
  const brightnessMax = Math.max(...channelStats.map((c) => c.max)) / 255;

  // Calculate contrast (variance and standard deviation)
  const channelCount = channelStats.length > 0 ? channelStats.length : 1;
  const variance =
    channelStats.reduce((sum, c) => sum + c.stdev * c.stdev, 0) /
    (channelCount * 255 * 255);
  const stdDev = Math.sqrt(variance);

  const result: ImageStats = {
    path: imagePath,
    width,
    height,
    channels,
    hasAlpha,
    brightness: {
      mean: brightnessMean,
      min: brightnessMin,
      max: brightnessMax,
    },
    contrast: {
      variance,
      stdDev,
    },
  };

  // Alpha channel statistics
  if (hasAlpha && channels === 4) {
    const alphaMean = channelStats[3].mean / 255;
    const alphaMin = channelStats[3].min / 255;

    result.alpha = {
      mean: 1 - alphaMean, // Convert to transparency (0 = opaque, 1 = transparent)
      fullyTransparent: alphaMin < 0.01, // Nearly fully transparent
      highTransparency: alphaMean < 128, // More than 50% transparent on average
    };
  }

  return result;
}

/**
 * Validate image against thresholds
 */
export function validateImage(
  stats: ImageStats,
  thresholds: ThresholdConfig,
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Brightness validation
  if (thresholds.brightness) {
    const { mean, min, max } = thresholds.brightness;

    if (mean) {
      if (mean.min !== undefined && stats.brightness.mean < mean.min) {
        errors.push({
          type: 'brightness',
          message: `Image too dark: mean brightness ${stats.brightness.mean.toFixed(3)} < ${mean.min}`,
          severity: 'error',
        });
      }
      if (mean.max !== undefined && stats.brightness.mean > mean.max) {
        errors.push({
          type: 'brightness',
          message: `Image too bright: mean brightness ${stats.brightness.mean.toFixed(3)} > ${mean.max}`,
          severity: 'error',
        });
      }
    }

    if (min !== undefined && stats.brightness.min < min) {
      warnings.push({
        type: 'brightness',
        message: `Very dark pixels detected: min brightness ${stats.brightness.min.toFixed(3)}`,
      });
    }

    if (max !== undefined && stats.brightness.max > max) {
      warnings.push({
        type: 'brightness',
        message: `Very bright pixels detected: max brightness ${stats.brightness.max.toFixed(3)}`,
      });
    }
  }

  // Contrast validation
  if (thresholds.contrast) {
    const { minVariance, minStdDev } = thresholds.contrast;

    if (minVariance !== undefined && stats.contrast.variance < minVariance) {
      errors.push({
        type: 'contrast',
        message: `Low contrast: variance ${stats.contrast.variance.toFixed(4)} < ${minVariance}`,
        severity: 'error',
      });
    }

    if (minStdDev !== undefined && stats.contrast.stdDev < minStdDev) {
      warnings.push({
        type: 'contrast',
        message: `Low dynamic range: std dev ${stats.contrast.stdDev.toFixed(4)} < ${minStdDev}`,
      });
    }
  }

  // Alpha/transparency validation
  if (thresholds.alpha && stats.alpha) {
    const { maxMeanTransparency, allowFullyTransparent } = thresholds.alpha;

    if (
      maxMeanTransparency !== undefined &&
      stats.alpha.mean > maxMeanTransparency
    ) {
      errors.push({
        type: 'transparency',
        message: `High transparency: ${(stats.alpha.mean * 100).toFixed(1)}% > ${(maxMeanTransparency * 100).toFixed(1)}%`,
        severity: 'error',
      });
    }

    if (!allowFullyTransparent && stats.alpha.fullyTransparent) {
      errors.push({
        type: 'transparency',
        message: 'Image contains fully transparent pixels',
        severity: 'error',
      });
    }
  }

  return { errors, warnings };
}

/**
 * Validate image dimensions
 */
export function validateDimensions(
  stats: ImageStats,
  filename: string,
  dimensionConfig?: {
    expected?: { width: number; height: number };
    pattern?: string;
  },
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!dimensionConfig) {
    return errors;
  }

  // Check expected dimensions
  if (dimensionConfig.expected) {
    const { width, height } = dimensionConfig.expected;
    if (stats.width !== width || stats.height !== height) {
      errors.push({
        type: 'dimensions',
        message: `Dimension mismatch: expected ${width}x${height}, got ${stats.width}x${stats.height}`,
        severity: 'error',
      });
    }
  }

  // Extract and validate from filename pattern
  if (dimensionConfig.pattern) {
    const regex = new RegExp(dimensionConfig.pattern);
    const match = filename.match(regex);

    if (match && match.length >= 3) {
      const expectedWidth = parseInt(match[1], 10);
      const expectedHeight = parseInt(match[2], 10);

      if (stats.width !== expectedWidth || stats.height !== expectedHeight) {
        errors.push({
          type: 'dimensions',
          message: `Filename indicates ${expectedWidth}x${expectedHeight}, but image is ${stats.width}x${stats.height}`,
          severity: 'error',
        });
      }
    }
  }

  return errors;
}

/**
 * Process a single image file
 */
export async function processImage(
  imagePath: string,
  thresholds: ThresholdConfig,
): Promise<ValidationResult> {
  try {
    const stats = await analyzeImage(imagePath);
    const filename = imagePath.split('/').pop() || '';

    // Validate image quality
    const { errors: qualityErrors, warnings } = validateImage(
      stats,
      thresholds,
    );

    // Validate dimensions
    const dimensionErrors = validateDimensions(
      stats,
      filename,
      thresholds.dimensions,
    );

    const errors = [...qualityErrors, ...dimensionErrors];

    return {
      path: imagePath,
      valid: errors.length === 0,
      errors,
      warnings,
      stats,
    };
  } catch (error) {
    return {
      path: imagePath,
      valid: false,
      errors: [
        {
          type: 'processing',
          message: `Failed to process image: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error',
        },
      ],
      warnings: [],
      stats: {
        path: imagePath,
        width: 0,
        height: 0,
        channels: 0,
        hasAlpha: false,
        brightness: { mean: 0, min: 0, max: 0 },
        contrast: { variance: 0, stdDev: 0 },
      },
    };
  }
}
