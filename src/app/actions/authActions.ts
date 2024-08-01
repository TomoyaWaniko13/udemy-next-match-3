'use server';

import { registerSchema, RegisterSchema } from '@/lib/schemas/registerSchema';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function registerUser(data: RegisterSchema) {
  const validated = registerSchema.safeParse(data);

  if (!validated.success) {
    return { error: validated.error.errors };
  }

  const { name, email, password } = validated.data;

  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) return { error: 'User already exists' };

  return prisma.user.create({
    data: { name, email, passwordHash: hashedPassword },
  });
}
