'use server';

import { registerSchema, RegisterSchema } from '@/lib/schemas/registerSchema';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ActionResult } from '@/types';
import { User } from '@prisma/client';

export async function registerUser(
  data: RegisterSchema
): Promise<ActionResult<User>> {
  try {
    const validated = registerSchema.safeParse(data);

    if (!validated.success) {
      // ZodIssue[]
      return { status: 'error', error: validated.error.errors };
    }

    const { name, email, password } = validated.data;

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // string
    if (existingUser) return { status: 'error', error: 'User already exists' };

    const user = await prisma.user.create({
      data: { name, email, passwordHash: hashedPassword },
    });

    return { status: 'success', data: user };
  } catch (error) {
    console.log(error);
    // string
    return { status: 'error', error: 'Something went wrong' };
  }
}
