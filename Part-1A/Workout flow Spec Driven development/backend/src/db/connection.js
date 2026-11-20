import { DatabaseSync } from 'node:sqlite';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedExercises } from './seed/exercises.js';
import { migrate } from './migrate.js';

const here = dirname(fileURLToPath(import.meta.url));

export function openDatabase(path = process.env.WORKOUT_DB_PATH || join(here, '../../../data/workouts.sqlite')) {
  const db = new DatabaseSync(path);
  migrate(db);
  seedExercises(db);
  return db;
}
