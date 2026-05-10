import { z } from 'zod';

export const ReduceStockSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'amount must be a number' })
    .int('amount must be an integer')
    .positive('amount must be greater than 0'),
  note: z.string().max(255).optional(),
});

export type ReduceStockDto = z.infer<typeof ReduceStockSchema>;
