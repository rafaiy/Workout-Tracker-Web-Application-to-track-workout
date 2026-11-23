import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { openDatabase } from './db/connection.js';
import { createApp } from './app.js';

const dbPath = resolve(process.env.WORKOUT_DB_PATH || 'data/workouts.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });
const db = openDatabase(dbPath);
const port = Number(process.env.PORT || 3000);
const server = createApp({ db }).listen(port, '127.0.0.1', () => {
  console.log(`Workout Tracker API listening on http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => { db.close(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
