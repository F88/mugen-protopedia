# Image QA Tool

Automated quality assurance for image assets - validates brightness, contrast, transparency, and dimensions.

## Features

- **Brightness Validation**: Detect images that are too dark or too bright
- **Contrast Analysis**: Flag flat images with low dynamic range
- **Transparency Checks**: Validate alpha channel statistics and transparency levels
- **Dimension Validation**: Ensure images match expected sizes (by pattern or exact dimensions)
- **Multiple Output Formats**: Human-readable text or JSON for CI parsing
- **Built-in Presets**: Pre-configured validation for PWA icons, OGP images, and screenshots
- **Custom Configuration**: Use JSON config files for custom validation rules

## Installation

The tool is already available in this repository. No additional installation needed.

## Usage

### Using Presets

```bash
# Validate PWA icons
npm run qa:icons

# Validate screenshots
npm run qa:screenshots

# List all available presets
npm run qa:images -- --list-presets
```

### Using Custom Configuration

```bash
# Use a custom config file
npm run qa:images -- --config tools/image-qa/example-config.json

# Validate specific images
npm run qa:images -- --preset pwa-icons public/icons/*.png
```

### Output Formats

```bash
# Human-readable output (default)
npm run qa:icons

# JSON output for CI parsing
npm run qa:icons -- --format json
```

## Presets

### pwa-icons

Strict validation for PWA icons (dimensions, transparency, brightness)

- Includes: `public/icons/**/*.png`
- Excludes maskable icons (which can have transparency)
- Validates dimensions match filename pattern (e.g., `icon-512x512.png` must be 512×512)

### ogp

Validation for Open Graph Protocol images

- Includes: `public/og-*.png`, `public/images/og-*.png`
- Expects: 1200×630 dimensions
- Moderate brightness and contrast requirements

### screenshots

Validation for application screenshots

- Includes: `public/screenshots/**/*.png`
- General brightness and contrast validation

## Configuration

### Example Configuration File

```json
{
    "include": ["public/icons/**/*.png"],
    "exclude": ["public/icons/**/*-maskable.png"],
    "thresholds": {
        "brightness": {
            "mean": { "min": 0.1, "max": 0.9 },
            "min": 0.0,
            "max": 1.0
        },
        "contrast": {
            "minVariance": 0.005,
            "minStdDev": 0.05
        },
        "alpha": {
            "maxMeanTransparency": 0.5,
            "allowFullyTransparent": false
        },
        "dimensions": {
            "pattern": "icon-(\\d+)x(\\d+)"
        }
    },
    "severity": "error"
}
```

### Configuration Options

#### include (required)

Array of glob patterns for files to validate.

#### exclude (optional)

Array of glob patterns for files to exclude.

#### thresholds.brightness

- `mean.min`: Minimum mean brightness (0-1, normalized)
- `mean.max`: Maximum mean brightness (0-1, normalized)
- `min`: Minimum pixel brightness threshold
- `max`: Maximum pixel brightness threshold

#### thresholds.contrast

- `minVariance`: Minimum variance (prevents flat/single-color images)
- `minStdDev`: Minimum standard deviation

#### thresholds.alpha

- `maxMeanTransparency`: Maximum average transparency (0-1)
- `allowFullyTransparent`: Whether to allow fully transparent pixels

#### thresholds.dimensions

- `expected`: Exact expected dimensions `{ width: 1200, height: 630 }`
- `pattern`: Regex pattern to extract expected dimensions from filename

#### severity

- `error`: Exit with non-zero code on violations
- `warning`: Report violations but don't fail

## CI Integration

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: npm ci

- name: Validate PWA icons
  run: npm run qa:icons

- name: Validate all images (JSON output)
  run: npm run qa:icons -- --format json > image-qa-report.json
```

### Exit Codes

- `0`: All images passed validation
- `1`: One or more images failed validation or error occurred

## CLI Options

```
Usage: image-qa [options] [paths...]

Options:
  -p, --preset <name>       Use a preset configuration (pwa-icons, ogp, screenshots)
  -c, --config <file>       Path to custom JSON configuration file
  -f, --format <format>     Output format: text (default) or json
  --list-presets            List available presets
  -h, --help                Show this help message
```

## Creating Test Fixtures

The repository includes test fixtures to demonstrate the tool's capabilities:

```bash
# Create test images (already done)
node tools/fixtures/create-test-images.mjs

# Test against fixtures
npm run qa:images -- --preset pwa-icons tools/fixtures/images/*.png
```

## Testing

```bash
# Run unit tests
npm test -- __tests__/tools/image-qa/

# Test on actual repository images
npm run qa:icons
```

## How It Works

1. **Image Analysis**: Uses Sharp library to read image metadata and compute statistics
    - Brightness: Calculates mean luminance using perceived brightness formula (0.299*R + 0.587*G + 0.114*B)
    - Contrast: Computes variance and standard deviation across channels
    - Transparency: Analyzes alpha channel statistics

2. **Validation**: Compares statistics against configured thresholds
    - Brightness range validation
    - Contrast/variance checks
    - Alpha channel validation
    - Dimension validation (pattern-based or exact)

3. **Reporting**: Generates detailed reports
    - Lists failed images with specific errors
    - Shows warnings for passed images with minor issues
    - Provides JSON output for programmatic processing

## Limitations

- Does not perform semantic content analysis (e.g., object recognition)
- Does not simulate color blindness or perceptual accessibility
- Basic heuristics for center-of-mass detection (not implemented yet)

## Future Enhancements

- Image diff preview artifacts in CI
- Visual dashboard in Storybook for asset inspection
- Center-of-mass detection for maskable icons
- Perceptual color contrast analysis (APCA)
- Support for additional image formats (JPEG, WebP)
