export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function parseId(value, name = 'id') {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1) throw new HttpError(400, 'INVALID_ID', `${name} must be a positive integer`);
  return Number(value);
}

export function rejectUnknownQuery(query) {
  if (Object.keys(query).length) throw new HttpError(400, 'INVALID_QUERY', 'Query parameters are not supported');
}

export function validateSessionInput(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'INVALID_BODY', 'A JSON object is required');
  const allowed = new Set(['title', 'startedAt']);
  if (Object.keys(body).some((key) => !allowed.has(key))) throw new HttpError(400, 'INVALID_BODY', 'Unexpected session field');
  if (partial && Object.keys(body).length === 0) throw new HttpError(400, 'INVALID_BODY', 'At least one field is required');
  const out = {};
  if ('title' in body) {
    if (typeof body.title !== 'string' || !body.title.trim()) throw new HttpError(400, 'INVALID_TITLE', 'Title must not be empty');
    out.title = body.title.trim();
  }
  if ('startedAt' in body) {
    if (typeof body.startedAt !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(body.startedAt) || Number.isNaN(Date.parse(body.startedAt))) {
      throw new HttpError(400, 'INVALID_TIMESTAMP', 'startedAt must be an ISO timestamp with a UTC offset');
    }
    out.startedAt = body.startedAt;
  }
  return out;
}

export function validateSets(input) {
  if (!Array.isArray(input) || input.length < 1) throw new HttpError(400, 'INVALID_SETS', 'At least one set is required');
  const seen = new Set();
  return input.map((set, index) => {
    if (!set || typeof set !== 'object' || Array.isArray(set) || Object.keys(set).some((key) => !['setNumber', 'weightKg', 'reps'].includes(key))) {
      throw new HttpError(400, 'INVALID_SET', `Set ${index + 1} is invalid`);
    }
    const setNumber = set.setNumber ?? index + 1;
    if (!Number.isInteger(setNumber) || setNumber < 1 || seen.has(setNumber)) throw new HttpError(400, 'INVALID_SET_NUMBER', 'Set numbers must be unique positive integers');
    seen.add(setNumber);
    if (typeof set.weightKg !== 'number' || !Number.isFinite(set.weightKg) || set.weightKg < 0 || Math.abs(set.weightKg * 10 - Math.round(set.weightKg * 10)) > 1e-7) {
      throw new HttpError(400, 'INVALID_WEIGHT', 'Weight must be a finite non-negative multiple of 0.1 kg');
    }
    if (!Number.isInteger(set.reps) || set.reps < 1) throw new HttpError(400, 'INVALID_REPS', 'Reps must be a positive whole number');
    return { setNumber, weightKg: Math.round(set.weightKg * 10) / 10, reps: set.reps };
  }).sort((a, b) => a.setNumber - b.setNumber);
}

export function validateExerciseInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => !['exerciseId', 'sets'].includes(key))) {
    throw new HttpError(400, 'INVALID_BODY', 'Expected exerciseId and sets');
  }
  return { exerciseId: parseId(body.exerciseId, 'exerciseId'), sets: validateSets(body.sets) };
}

export function validateSetList(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => key !== 'sets')) {
    throw new HttpError(400, 'INVALID_BODY', 'Expected a sets field');
  }
  return validateSets(body.sets);
}
