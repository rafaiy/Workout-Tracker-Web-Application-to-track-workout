export const exerciseSeeds = [
  ['Chest Press Machine', 'Chest'],
  ['Back Extension', 'Back'],
  ['Cable Bench Press', 'Chest'],
  ['Dumbbell Chest Press', 'Chest'],
  ['Chest Fly', 'Chest'],
  ['Shoulder Press', 'Shoulders'],
  ['Lat Pulldown', 'Back'],
  ['Leg Press', 'Legs'],
  ['Bicep Curl', 'Arms'],
  ['Tricep Pushdown', 'Arms']
];

export function seedExercises(db) {
  const insert = db.prepare('INSERT OR IGNORE INTO ExerciseCatalog(name, muscleGroup) VALUES (?, ?)');
  for (const item of exerciseSeeds) insert.run(...item);
}
