#!/usr/bin/env node

import { parseArgs } from 'util';
import { runQA, loadConfig, getPreset } from './runner.js';
import { formatTextReport, formatJsonReport } from './formatter.js';
import { presets } from './presets.js';

/**
 * CLI for image QA tool
 */

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      preset: {
        type: 'string',
        short: 'p',
      },
      config: {
        type: 'string',
        short: 'c',
      },
      format: {
        type: 'string',
        short: 'f',
        default: 'text',
      },
      help: {
        type: 'boolean',
        short: 'h',
      },
      'list-presets': {
        type: 'boolean',
      },
    },
    allowPositionals: true,
  });

  // Show help
  if (values.help) {
    console.log(`
Image QA Tool - Automated validation for image assets

USAGE:
  image-qa [options] [paths...]

OPTIONS:
  -p, --preset <name>       Use a preset configuration (pwa-icons, ogp, screenshots)
  -c, --config <file>       Path to custom JSON configuration file
  -f, --format <format>     Output format: text (default) or json
  --list-presets            List available presets
  -h, --help                Show this help message

EXAMPLES:
  # Validate PWA icons using preset
  image-qa --preset pwa-icons

  # Validate specific images with custom config
  image-qa --config qa-config.json public/icons/*.png

  # Output as JSON for CI parsing
  image-qa --preset pwa-icons --format json

  # List available presets
  image-qa --list-presets
`);
    process.exit(0);
  }

  // List presets
  if (values['list-presets']) {
    console.log('\nAvailable presets:\n');
    for (const [name, preset] of Object.entries(presets)) {
      console.log(`  ${name}`);
      console.log(`    ${preset.description}`);
      console.log(`    Include: ${preset.config.include.join(', ')}`);
      console.log('');
    }
    process.exit(0);
  }

  // Load configuration
  let config;
  if (values.config) {
    config = await loadConfig(values.config);
  } else if (values.preset) {
    config = getPreset(values.preset);
  } else {
    console.error(
      'Error: Either --preset or --config must be specified.\nUse --help for usage information.',
    );
    process.exit(1);
  }

  // Override include patterns if positionals provided
  if (positionals.length > 0) {
    config.include = positionals;
  }

  // Run QA
  try {
    const report = await runQA(config);

    // Format and output report
    if (values.format === 'json') {
      console.log(formatJsonReport(report));
    } else {
      console.log(formatTextReport(report));
    }

    // Exit with appropriate code
    if (report.failed > 0 && config.severity === 'error') {
      process.exit(1);
    }
  } catch (error) {
    console.error(
      'Error running QA:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
