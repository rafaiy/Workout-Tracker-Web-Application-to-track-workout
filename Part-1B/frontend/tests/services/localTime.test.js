import { describe, expect, it } from 'vitest';
import { captureLocalTime } from '../../src/services/localTime.js';

describe('browser local time capture', () => {
  it('preserves the device instant and includes an offset and IANA zone', () => {
    const now = new Date('2026-11-23T06:30:15.000Z');
    const captured = captureLocalTime(now);
    expect(new Date(captured.instant).getTime()).toBe(now.getTime());
    expect(captured.instant).toMatch(/[+-]\d{2}:\d{2}$/);
    expect(captured.timeZone).toBeTruthy();
  });
});
