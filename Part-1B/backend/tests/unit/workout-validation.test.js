import { describe, expect, it } from 'vitest';
import { positiveSetSchema, sessionCreateSchema, timeZoneSchema } from '../../src/schemas/common.schema.js';
import { localDateAndPeriod, localDateTimeToIso, timeOfDay } from '../../src/services/time.js';

describe('workout input rules', () => {
  it('requires positive finite kilograms and positive integer repetitions', () => {
    expect(positiveSetSchema.safeParse({ weightKg: 40, reps: 15 }).success).toBe(true);
    for (const weightKg of [0, -1, Infinity, NaN]) expect(positiveSetSchema.safeParse({ weightKg, reps: 10 }).success).toBe(false);
    for (const reps of [0, -1, 2.5]) expect(positiveSetSchema.safeParse({ weightKg: 10, reps }).success).toBe(false);
  });

  it('accepts valid IANA zones and offset-bearing session instants', () => {
    expect(timeZoneSchema.safeParse('Asia/Kolkata').success).toBe(true);
    expect(timeZoneSchema.safeParse('Not/AZone').success).toBe(false);
    expect(sessionCreateSchema.safeParse({ startedAt: '2026-11-23T06:30:00+05:30', timeZone: 'Asia/Kolkata' }).success).toBe(true);
  });

  it('uses the specified local-time buckets including night across midnight', () => {
    expect(timeOfDay(5)).toBe('morning'); expect(timeOfDay(11)).toBe('morning');
    expect(timeOfDay(12)).toBe('afternoon'); expect(timeOfDay(16)).toBe('afternoon');
    expect(timeOfDay(17)).toBe('evening'); expect(timeOfDay(20)).toBe('evening');
    expect(timeOfDay(21)).toBe('night'); expect(timeOfDay(4)).toBe('night');
    expect(localDateAndPeriod('2026-11-23T01:00:00.000Z', 'Asia/Kolkata')).toEqual({ date: '2026-11-23', period: 'morning' });
  });

  it('converts a local wall clock to its correct UTC instant', () => {
    expect(localDateTimeToIso('2026-11-23', '06:30', 'Asia/Kolkata')).toBe('2026-11-23T01:00:00.000Z');
    expect(() => localDateTimeToIso('2026-02-30', '06:30', 'Asia/Kolkata')).toThrow();
    expect(() => localDateTimeToIso('not-a-date', '06:30', 'Asia/Kolkata')).toThrow();
  });
});
