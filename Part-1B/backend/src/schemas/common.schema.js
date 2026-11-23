import { z } from 'zod';

export const positiveSetSchema = z.object({
  weightKg: z.number().finite().gt(0, 'Weight must be greater than 0 kg.'),
  reps: z.number().int().gt(0, 'Reps must be a whole number greater than 0.'),
});

export const setsSchema = z.array(positiveSetSchema).min(1, 'Add at least one complete set.');
export const timeZoneSchema = z.string().min(1).refine((zone) => {
  try { new Intl.DateTimeFormat('en', { timeZone: zone }); return true; } catch { return false; }
}, 'Enter a valid IANA time zone.');
export const instantSchema = z.string().datetime({ offset: true });
export const sessionCreateSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  startedAt: instantSchema,
  timeZone: timeZoneSchema,
});
export const setInputSchema = positiveSetSchema;
export const exerciseInputSchema = z.object({ exerciseId: z.number().int().positive(), sets: setsSchema });
export const sessionPatchSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  startedAt: instantSchema.optional(),
  timeZone: timeZoneSchema.optional(),
}).refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update.')
  .refine((v) => Boolean(v.startedAt) === Boolean(v.timeZone), 'startedAt and timeZone must be updated together.');
export const parseRequestSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  timeZone: timeZoneSchema,
  submittedAt: instantSchema,
  targetSessionId: z.number().int().positive().optional(),
});

export function parseOrThrow(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = new Error(result.error.issues.map((issue) => issue.message).join(' '));
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = result.error.issues.map(({ path, message }) => ({ path: path.join('.'), message }));
    throw error;
  }
  return result.data;
}
