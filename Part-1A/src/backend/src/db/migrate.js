import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export function migrate(db) {
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(readFileSync(join(here, 'migrations/001-workout-schema.sql'), 'utf8'));
}
