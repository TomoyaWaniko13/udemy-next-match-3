import { z } from 'zod';

// 81 (Creating a chat form)
export const messageSchema = z.object({
  text: z.string().min(1, { message: 'Content is required' }),
});

export type MessageSchema = z.infer<typeof messageSchema>;
