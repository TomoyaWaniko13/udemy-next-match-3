'use server';

import { registerSchema, RegisterSchema } from '@/lib/schemas/registerSchema';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ActionResult } from '@/types';
import { User } from '@prisma/client';
import { LoginSchema } from '@/lib/schemas/loginSchema';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

// 30 (Signing in users Part 2)
// signIn()を使って、サーバーサイドで、email, passwordをもとにloginする。
export async function signInUser(data: LoginSchema): Promise<ActionResult<string>> {
  console.log('signInUser() working!');
  try {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    console.log(result);

    return { status: 'success', data: 'Logged in' };
  } catch (error) {
    console.log(error);

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { status: 'error', error: 'invalid credentials' };
        default:
          return { status: 'error', error: 'Something went wrong' };
      }
    } else {
      return { status: 'error', error: 'Something else went wrong' };
    }
  }
}

// RegisterForm.tsxで使用される。
// name, email, passwordで新しいuserをregisterする。
export async function registerUser(data: RegisterSchema): Promise<ActionResult<User>> {
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

// used in auth.config.ts
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
