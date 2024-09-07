import { z } from 'zod';
import { calculateAge } from '@/lib/util';

export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters',
  }),
});

// 138 (Adding a Register wizard part 1)
export const profileSchema = z.object({
  gender: z.string().min(1),
  description: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  dateOfBirth: z
    .string()
    .min(1, { message: 'Date of birth is required' })
    .refine(
      (dateString) => {
        const age = calculateAge(new Date(dateString));
        return age >= 18;
      },
      {
        message: 'You must be at least 18 to use this app',
      },
    ), // end of refine()
});

// 141 (Submitting the form)
export const combineRegisterSchema = registerSchema.and(profileSchema);

// 139 (Adding a Register wizard Part 2)
// 2つのスキーマを組み合わせています。
export type RegisterSchema = z.infer<typeof registerSchema & typeof profileSchema>;
