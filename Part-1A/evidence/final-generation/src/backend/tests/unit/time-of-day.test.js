import test from 'node:test';
import assert from 'node:assert/strict';
import { timeOfDayLabel } from '../../src/modules/sessions/time-of-day.js';

test('labels the local wall-clock hour at every time-of-day boundary', () => {
  const cases = [
    ['04:59', 'Night Workout'], ['05:00', 'Morning Workout'],
    ['11:59', 'Morning Workout'], ['12:00', 'Afternoon Workout'],
    ['16:59', 'Afternoon Workout'], ['17:00', 'Evening Workout'],
    ['20:59', 'Evening Workout'], ['21:00', 'Night Workout']
  ];
  for (const [time, expected] of cases) {
    assert.equal(timeOfDayLabel(`2026-11-20T${time}:00+05:30`), expected);
  }
});

test('rejects timestamps that cannot produce a session label', () => {
  assert.throws(() => timeOfDayLabel('not-a-date'), /Invalid session timestamp/);
});
