import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadSnapshot(filename: string) {
  // Determine subdirectory based on NODE_ENV
  // 'test' for test environment, 'dev' for development (and others)
  const subDir = process.env.NODE_ENV === 'test' ? 'test' : 'dev';
  const path = join(__dirname, 'snapshots', subDir, filename);
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Snapshot not found: ${filename}`, error);
    return null;
  }
}
