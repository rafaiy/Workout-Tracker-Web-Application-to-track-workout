export function createExerciseRepository(db) {
  return {
    list() { return db.prepare('SELECT id, name, muscleGroup FROM ExerciseCatalog ORDER BY name').all(); },
    get(id) { return db.prepare('SELECT id, name, muscleGroup FROM ExerciseCatalog WHERE id = ?').get(id); }
  };
}
