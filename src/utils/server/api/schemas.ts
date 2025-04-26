import { z } from 'zod';

export const SwapFormSchema = z.object({
  fromAmount: z.number(),
  toAmount: z.number(),
});
