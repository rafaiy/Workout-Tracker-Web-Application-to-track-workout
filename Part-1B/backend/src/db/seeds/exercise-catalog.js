export const EXERCISES = [
  ['Chest press machine', 'Chest'],
  ['Back extension', 'Back'],
  ['Cable bench press', 'Chest'],
  ['Dumbbell chest press', 'Chest'],
  ['Chest fly', 'Chest'],
  ['Shoulder press', 'Shoulders'],
  ['Lat pulldown', 'Back'],
  ['Seated cable row', 'Back'],
  ['Leg press', 'Legs'],
  ['Leg extension', 'Legs'],
  ['Leg curl', 'Legs'],
  ['Goblet squat', 'Legs'],
  ['Dumbbell shoulder press', 'Shoulders'],
  ['Lateral raise', 'Shoulders'],
  ['Biceps curl', 'Arms'],
  ['Triceps pushdown', 'Arms'],
  ['Calf raise', 'Legs'],
];

export function seedCatalog(db) {
  const upsert = db.prepare(`INSERT INTO ExerciseCatalog(name, muscleGroup) VALUES (?, ?)
    ON CONFLICT(name) DO UPDATE SET muscleGroup = excluded.muscleGroup`);
  const seedAll = db.transaction(() => EXERCISES.forEach(([name, group]) => upsert.run(name, group)));
  seedAll();
}
