import { localDateAndPeriod } from '../services/time.js';

function mapSet(row) { return { setNumber: row.setNumber, weightKg: row.weightKg, reps: row.reps }; }

export function createRepositories(db) {
  const catalog = {
    list: () => db.prepare('SELECT id, name, muscleGroup FROM ExerciseCatalog ORDER BY name COLLATE NOCASE').all(),
    byId: (id) => db.prepare('SELECT id, name, muscleGroup FROM ExerciseCatalog WHERE id = ?').get(id),
    byName: (name) => db.prepare('SELECT id, name, muscleGroup FROM ExerciseCatalog WHERE lower(name) = lower(?)').get(name),
  };

  const sessionDetailQuery = `SELECT s.id sessionId, s.title, s.status, s.startedAt, s.timeZone, s.completedAt, s.createdAt, s.updatedAt,
    se.id sessionExerciseId, se.orderIndex, e.id exerciseId, e.name exerciseName, e.muscleGroup,
    es.setNumber, es.weightKg, es.reps
    FROM WorkoutSession s LEFT JOIN SessionExercise se ON se.sessionId=s.id
    LEFT JOIN ExerciseCatalog e ON e.id=se.exerciseId
    LEFT JOIN ExerciseSet es ON es.sessionExerciseId=se.id
    WHERE s.id=? ORDER BY se.orderIndex, es.setNumber`;

  function get(id) {
    const rows = db.prepare(sessionDetailQuery).all(id);
    if (!rows.length) return null;
    const first = rows[0];
    const session = {
      id: first.sessionId, title: first.title, status: first.status, startedAt: first.startedAt,
      timeZone: first.timeZone, timeOfDay: localDateAndPeriod(first.startedAt, first.timeZone).period,
      completedAt: first.completedAt, createdAt: first.createdAt, updatedAt: first.updatedAt, exercises: [],
    };
    session.timeOfDay = localDateAndPeriod(first.startedAt, first.timeZone).period;
    const exerciseMap = new Map();
    for (const row of rows) {
      if (!row.sessionExerciseId) continue;
      if (!exerciseMap.has(row.sessionExerciseId)) {
        const exercise = { id: row.sessionExerciseId, exercise: { id: row.exerciseId, name: row.exerciseName, muscleGroup: row.muscleGroup }, orderIndex: row.orderIndex, sets: [] };
        exerciseMap.set(row.sessionExerciseId, exercise); session.exercises.push(exercise);
      }
      if (row.setNumber) exerciseMap.get(row.sessionExerciseId).sets.push(mapSet(row));
    }
    return session;
  }

  const sessions = {
    create({ title, startedAt, timeZone }) {
      const now = new Date().toISOString();
      const info = db.prepare(`INSERT INTO WorkoutSession(title,status,startedAt,timeZone,completedAt,createdAt,updatedAt)
        VALUES (?, 'PENDING', ?, ?, NULL, ?, ?)`).run(title, new Date(startedAt).toISOString(), timeZone, now, now);
      return Number(info.lastInsertRowid);
    },
    createWithExercise({ title, startedAt, timeZone, exerciseId, sets }) {
      const createTx = db.transaction(() => {
        const now = new Date().toISOString();
        const sessionInfo = db.prepare(`INSERT INTO WorkoutSession(title,status,startedAt,timeZone,completedAt,createdAt,updatedAt)
          VALUES (?, 'PENDING', ?, ?, NULL, ?, ?)`).run(title, new Date(startedAt).toISOString(), timeZone, now, now);
        const sessionId = Number(sessionInfo.lastInsertRowid);
        const exerciseInfo = db.prepare('INSERT INTO SessionExercise(sessionId,exerciseId,orderIndex) VALUES (?,?,0)').run(sessionId, exerciseId);
        const insertSet = db.prepare('INSERT INTO ExerciseSet(sessionExerciseId,setNumber,weightKg,reps) VALUES (?,?,?,?)');
        sets.forEach((set, index) => insertSet.run(Number(exerciseInfo.lastInsertRowid), index + 1, set.weightKg, set.reps));
        return sessionId;
      });
      return createTx();
    },
    get,
    list(status) {
      const query = status
        ? db.prepare('SELECT s.*, (SELECT COUNT(*) FROM SessionExercise se WHERE se.sessionId=s.id) exerciseCount FROM WorkoutSession s WHERE status=? ORDER BY startedAt DESC,id DESC')
        : db.prepare('SELECT s.*, (SELECT COUNT(*) FROM SessionExercise se WHERE se.sessionId=s.id) exerciseCount FROM WorkoutSession s ORDER BY startedAt DESC,id DESC');
      return (status ? query.all(status) : query.all()).map((row) => ({
        id: row.id, title: row.title, status: row.status, startedAt: row.startedAt, timeZone: row.timeZone,
        timeOfDay: localDateAndPeriod(row.startedAt, row.timeZone).period, completedAt: row.completedAt, exerciseCount: row.exerciseCount,
      }));
    },
    update(id, patch) {
      const current = db.prepare('SELECT * FROM WorkoutSession WHERE id=?').get(id);
      if (!current) return false;
      db.prepare(`UPDATE WorkoutSession SET title=?, startedAt=?, timeZone=?, updatedAt=? WHERE id=?`)
        .run(patch.title ?? current.title, patch.startedAt ? new Date(patch.startedAt).toISOString() : current.startedAt,
          patch.timeZone ?? current.timeZone, new Date().toISOString(), id);
      return true;
    },
    complete(id) {
      const current = db.prepare('SELECT status FROM WorkoutSession WHERE id=?').get(id);
      if (!current) return false;
      if (current.status === 'PENDING') db.prepare("UPDATE WorkoutSession SET status='COMPLETED', completedAt=?, updatedAt=? WHERE id=?")
        .run(new Date().toISOString(), new Date().toISOString(), id);
      return true;
    },
    delete(id) { return db.prepare('DELETE FROM WorkoutSession WHERE id=?').run(id).changes > 0; },
    findMatches(startedAt, timeZone) {
      const target = localDateAndPeriod(startedAt, timeZone);
      return db.prepare('SELECT id,title,status,startedAt,timeZone FROM WorkoutSession ORDER BY startedAt DESC').all()
        .filter((row) => {
          const local = localDateAndPeriod(row.startedAt, row.timeZone);
          return local.date === target.date && local.period === target.period;
        }).map((row) => ({ sessionId: row.id, title: row.title, status: row.status, startedAt: row.startedAt, timeZone: row.timeZone }));
    },
  };

  const exercises = {
    add(sessionId, exerciseId, sets) {
      const addTx = db.transaction(() => {
        const orderIndex = db.prepare('SELECT COALESCE(MAX(orderIndex), -1)+1 AS n FROM SessionExercise WHERE sessionId=?').get(sessionId).n;
        const info = db.prepare('INSERT INTO SessionExercise(sessionId,exerciseId,orderIndex) VALUES (?,?,?)').run(sessionId, exerciseId, orderIndex);
        const id = Number(info.lastInsertRowid);
        const insertSet = db.prepare('INSERT INTO ExerciseSet(sessionExerciseId,setNumber,weightKg,reps) VALUES (?,?,?,?)');
        sets.forEach((set, i) => insertSet.run(id, i + 1, set.weightKg, set.reps));
        return id;
      });
      return addTx();
    },
    update(sessionId, id, exerciseId, sets) {
      const updateTx = db.transaction(() => {
        const row = db.prepare('SELECT id FROM SessionExercise WHERE id=? AND sessionId=?').get(id, sessionId);
        if (!row) return false;
        db.prepare('UPDATE SessionExercise SET exerciseId=? WHERE id=?').run(exerciseId, id);
        db.prepare('DELETE FROM ExerciseSet WHERE sessionExerciseId=?').run(id);
        const insertSet = db.prepare('INSERT INTO ExerciseSet(sessionExerciseId,setNumber,weightKg,reps) VALUES (?,?,?,?)');
        sets.forEach((set, i) => insertSet.run(id, i + 1, set.weightKg, set.reps));
        return true;
      });
      return updateTx();
    },
    delete(sessionId, id) { return db.prepare('DELETE FROM SessionExercise WHERE id=? AND sessionId=?').run(id, sessionId).changes > 0; },
  };
  return { catalog, sessions, exercises };
}
