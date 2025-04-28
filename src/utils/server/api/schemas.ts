import { z } from 'zod';

export const SwapFormSchema = z.object({
  fromAmount: z.number().min(0.00000001),
  toAmount: z.number(),
});
