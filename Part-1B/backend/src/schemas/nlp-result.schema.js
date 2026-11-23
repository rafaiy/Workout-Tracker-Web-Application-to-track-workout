import { z } from 'zod';

const set = z.object({ weightKg: z.number().finite(), reps: z.number() });
const parsed = z.object({
  outcome: z.literal('parsed'),
  exerciseName: z.string().min(1),
  sets: z.array(set).min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  localTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  title: z.string().max(100).optional(),
});

export const nlpResultSchema = z.discriminatedUnion('outcome', [
  parsed,
  z.object({ outcome: z.literal('needs_clarification'), reason: z.string().min(1), message: z.string().min(1) }),
  z.object({ outcome: z.literal('unsupported_exercise'), exerciseName: z.string().optional(), message: z.string().min(1) }),
  z.object({ outcome: z.literal('invalid_input'), message: z.string().min(1) }),
]);
