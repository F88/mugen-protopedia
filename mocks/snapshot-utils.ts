import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadSnapshot(filename: string) {
  const path = join(__dirname, 'snapshots', filename);
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Snapshot not found: ${filename}`, error);
    return null;
  }
}
