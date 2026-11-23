function mapSession(row, exercises = []) {
  if (!row) return null;
  return { id: row.id, title: row.title, status: row.status, startedAt: row.startedAt, completedAt: row.completedAt, exercises };
}

export function createSessionRepository(db) {
  function get(id) {
    const row = db.prepare('SELECT * FROM WorkoutSession WHERE id = ?').get(id);
    if (!row) return null;
    const exerciseRows = db.prepare(`SELECT se.id, se.exerciseId, ec.name, ec.muscleGroup, se.orderIndex
      FROM SessionExercise se JOIN ExerciseCatalog ec ON ec.id = se.exerciseId
      WHERE se.sessionId = ? ORDER BY se.orderIndex`).all(id);
    const setsQuery = db.prepare('SELECT id, setNumber, weightKg, reps FROM ExerciseSet WHERE sessionExerciseId = ? ORDER BY setNumber');
    return mapSession(row, exerciseRows.map((ex) => ({ ...ex, sets: setsQuery.all(ex.id) })));
  }

  const insertSets = db.prepare('INSERT INTO ExerciseSet(sessionExerciseId, setNumber, weightKg, reps) VALUES (?, ?, ?, ?)');
  return {
    create({ title, startedAt }) {
      const result = db.prepare('INSERT INTO WorkoutSession(title, status, startedAt, completedAt) VALUES (?, \'PENDING\', ?, NULL)').run(title, startedAt);
      return get(Number(result.lastInsertRowid));
    },
    get,
    list() {
      return db.prepare('SELECT * FROM WorkoutSession ORDER BY startedAt DESC, id DESC').all().map((row) => ({
        ...mapSession(row), timeOfDayLabel: null
      }));
    },
    addExercise(sessionId, exerciseId, sets) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const session = db.prepare('SELECT status FROM WorkoutSession WHERE id = ?').get(sessionId);
        if (!session) { db.exec('ROLLBACK'); return { missing: 'session' }; }
        if (session.status !== 'PENDING') { db.exec('ROLLBACK'); return { completed: true }; }
        if (!db.prepare('SELECT 1 FROM ExerciseCatalog WHERE id = ?').get(exerciseId)) { db.exec('ROLLBACK'); return { missing: 'exercise' }; }
        const orderIndex = Number(db.prepare('SELECT COALESCE(MAX(orderIndex), -1) + 1 AS n FROM SessionExercise WHERE sessionId = ?').get(sessionId).n);
        const result = db.prepare('INSERT INTO SessionExercise(sessionId, exerciseId, orderIndex) VALUES (?, ?, ?)').run(sessionId, exerciseId, orderIndex);
        const exerciseEntryId = Number(result.lastInsertRowid);
        for (const set of sets) insertSets.run(exerciseEntryId, set.setNumber, set.weightKg, set.reps);
        db.exec('COMMIT');
        return { exercise: get(sessionId).exercises.find((e) => e.id === exerciseEntryId) };
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    complete(id, at) {
      const current = db.prepare('SELECT * FROM WorkoutSession WHERE id = ?').get(id);
      if (!current) return null;
      if (current.status === 'PENDING') db.prepare("UPDATE WorkoutSession SET status = 'COMPLETED', completedAt = ? WHERE id = ?").run(at, id);
      return get(id);
    },
    update(id, fields) {
      const current = db.prepare('SELECT id FROM WorkoutSession WHERE id = ?').get(id);
      if (!current) return null;
      const keys = Object.keys(fields);
      if (keys.length) db.prepare(`UPDATE WorkoutSession SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`).run(...keys.map((k) => fields[k]), id);
      return get(id);
    },
    replaceSets(sessionId, exerciseEntryId, sets) {
      const entry = db.prepare('SELECT id FROM SessionExercise WHERE id = ? AND sessionId = ?').get(exerciseEntryId, sessionId);
      if (!entry) return null;
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('DELETE FROM ExerciseSet WHERE sessionExerciseId = ?').run(exerciseEntryId);
        for (const set of sets) insertSets.run(exerciseEntryId, set.setNumber, set.weightKg, set.reps);
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
      return get(sessionId).exercises.find((e) => e.id === exerciseEntryId);
    },
    deleteExercise(sessionId, exerciseEntryId) {
      return Number(db.prepare('DELETE FROM SessionExercise WHERE id = ? AND sessionId = ?').run(exerciseEntryId, sessionId).changes) > 0;
    },
    delete(id) { return Number(db.prepare('DELETE FROM WorkoutSession WHERE id = ?').run(id).changes) > 0; }
  };
}
