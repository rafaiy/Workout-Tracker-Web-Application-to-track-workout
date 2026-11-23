PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS ExerciseCatalog (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  muscleGroup TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS WorkoutSession (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED')),
  startedAt TEXT NOT NULL,
  timeZone TEXT NOT NULL,
  completedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS SessionExercise (
  id INTEGER PRIMARY KEY,
  sessionId INTEGER NOT NULL REFERENCES WorkoutSession(id) ON DELETE CASCADE,
  exerciseId INTEGER NOT NULL REFERENCES ExerciseCatalog(id) ON DELETE RESTRICT,
  orderIndex INTEGER NOT NULL CHECK (orderIndex >= 0),
  UNIQUE(sessionId, orderIndex)
);

CREATE TABLE IF NOT EXISTS ExerciseSet (
  id INTEGER PRIMARY KEY,
  sessionExerciseId INTEGER NOT NULL REFERENCES SessionExercise(id) ON DELETE CASCADE,
  setNumber INTEGER NOT NULL CHECK (setNumber > 0),
  weightKg REAL NOT NULL CHECK (weightKg > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  UNIQUE(sessionExerciseId, setNumber)
);

CREATE INDEX IF NOT EXISTS idx_session_started ON WorkoutSession(startedAt DESC);
CREATE INDEX IF NOT EXISTS idx_session_status_started ON WorkoutSession(status, startedAt DESC);
CREATE INDEX IF NOT EXISTS idx_session_exercise_order ON SessionExercise(sessionId, orderIndex);
CREATE INDEX IF NOT EXISTS idx_set_order ON ExerciseSet(sessionExerciseId, setNumber);
