import { z } from 'zod';

// 63 (Adding the edit member form)
export const memberEditSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
});

export type MemberEditSchema = z.infer<typeof memberEditSchema>;
