const formatterCache = new Map();

function formatterFor(timeZone) {
  if (!formatterCache.has(timeZone)) formatterCache.set(timeZone, new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }));
  return formatterCache.get(timeZone);
}

export function localParts(instant, timeZone) {
  const parts = Object.fromEntries(formatterFor(timeZone).formatToParts(new Date(instant)).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second) };
}

export function timeOfDay(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function localDateAndPeriod(instant, timeZone) {
  const parts = localParts(instant, timeZone);
  return { date: parts.date, period: timeOfDay(parts.hour) };
}

export function localDateTimeToIso(date, time, timeZone) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Use a valid local date and time.');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const wallUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  if (new Date(wallUtc).toISOString().slice(0, 16) !== `${date}T${time}`) throw new Error('The workout date or time is invalid.');
  let guess = wallUtc;
  for (let i = 0; i < 4; i += 1) {
    const p = localParts(guess, timeZone);
    const represented = Date.UTC(Number(p.date.slice(0, 4)), Number(p.date.slice(5, 7)) - 1, Number(p.date.slice(8, 10)), p.hour, p.minute, p.second);
    guess += wallUtc - represented;
  }
  const check = localParts(guess, timeZone);
  if (check.date !== date || check.hour !== hour || check.minute !== minute) throw new Error('That local time does not exist in the selected time zone.');
  return new Date(guess).toISOString();
}

export function localDateTimeFromIso(instant, timeZone) {
  const p = localParts(instant, timeZone);
  return { date: p.date, time: `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}` };
}
