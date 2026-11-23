CREATE TABLE IF NOT EXISTS ExerciseCatalog (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  muscleGroup TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS WorkoutSession (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(trim(title)) > 0),
  status TEXT NOT NULL CHECK(status IN ('PENDING', 'COMPLETED')),
  startedAt TEXT NOT NULL,
  completedAt TEXT,
  CHECK((status = 'PENDING' AND completedAt IS NULL) OR
        (status = 'COMPLETED' AND completedAt IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS SessionExercise (
  id INTEGER PRIMARY KEY,
  sessionId INTEGER NOT NULL REFERENCES WorkoutSession(id) ON DELETE CASCADE,
  exerciseId INTEGER NOT NULL REFERENCES ExerciseCatalog(id) ON DELETE RESTRICT,
  orderIndex INTEGER NOT NULL CHECK(orderIndex >= 0),
  UNIQUE(sessionId, orderIndex)
);

CREATE TABLE IF NOT EXISTS ExerciseSet (
  id INTEGER PRIMARY KEY,
  sessionExerciseId INTEGER NOT NULL REFERENCES SessionExercise(id) ON DELETE CASCADE,
  setNumber INTEGER NOT NULL CHECK(setNumber > 0),
  weightKg REAL NOT NULL CHECK(weightKg >= 0 AND abs(weightKg * 10 - round(weightKg * 10)) < 0.000001),
  reps INTEGER NOT NULL CHECK(reps > 0 AND typeof(reps) = 'integer'),
  UNIQUE(sessionExerciseId, setNumber)
);
