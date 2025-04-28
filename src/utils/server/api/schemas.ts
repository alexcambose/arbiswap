import { z } from 'zod';

export const SwapFormSchema = z.object({
  fromAmount: z.number().min(0.000001),
  toAmount: z.number(),
});
