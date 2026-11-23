import { createDatabase } from './connection.js';
import { seedCatalog } from './seeds/exercise-catalog.js';

const db = createDatabase();
seedCatalog(db);
db.close();
console.log('Workout database migrated and catalog seeded.');
