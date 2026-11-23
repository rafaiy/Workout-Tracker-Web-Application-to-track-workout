import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.join(here, 'migrations', '001-initial-schema.sql');

export function openDatabase(filePath = config.databasePath) {
  if (filePath !== ':memory:') fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma('foreign_keys = ON');
  return db;
}

export function migrateDatabase(db) {
  db.pragma('foreign_keys = ON');
  db.exec(fs.readFileSync(migrationPath, 'utf8'));
  return db;
}

export function createDatabase(filePath = config.databasePath) {
  return migrateDatabase(openDatabase(filePath));
}
