export function timeOfDayLabel(value) {
  let hour;
  if (typeof value === 'string') {
    const match = value.match(/T(\d{2}):\d{2}/);
    if (match && !Number.isNaN(Date.parse(value))) hour = Number(match[1]);
  }
  if (hour === undefined) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) throw new TypeError('Invalid session timestamp');
    hour = date.getHours();
  }
  if (hour >= 5 && hour < 12) return 'Morning Workout';
  if (hour >= 12 && hour < 17) return 'Afternoon Workout';
  if (hour >= 17 && hour < 21) return 'Evening Workout';
  return 'Night Workout';
}

export function normalizeTimestamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError('Invalid session timestamp');
  // Preserve the local wall-clock time and offset used to create the session.
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const offset = Math.abs(offsetMinutes);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return `${local.toISOString().slice(0, 19)}${sign}${String(Math.floor(offset / 60)).padStart(2, '0')}:${String(offset % 60).padStart(2, '0')}`;
}
