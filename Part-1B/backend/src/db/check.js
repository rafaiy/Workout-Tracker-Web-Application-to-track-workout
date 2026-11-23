import { createDatabase } from './connection.js';
import { seedCatalog } from './seeds/exercise-catalog.js';
const db = createDatabase(':memory:');
seedCatalog(db);
const foreignKeys = db.pragma('foreign_keys', { simple: true });
const exerciseCount = db.prepare('SELECT COUNT(*) AS count FROM ExerciseCatalog').get().count;
db.close();
if (foreignKeys !== 1 || exerciseCount < 6) process.exitCode = 1;
else console.log(`Database checks passed (${exerciseCount} catalog exercises; foreign keys enabled).`);
