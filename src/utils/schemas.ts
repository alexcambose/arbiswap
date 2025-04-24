import { z } from 'zod';

export const SwapFormSchema = z.object({
  fromAmount: z.string(),
  toAmount: z.string(),
});
