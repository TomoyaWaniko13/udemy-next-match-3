'use server';

import { combineRegisterSchema, registerSchema, RegisterSchema } from '@/lib/schemas/registerSchema';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ActionResult } from '@/types';
import { User } from '@prisma/client';
import { LoginSchema } from '@/lib/schemas/loginSchema';

import { AuthError } from 'next-auth';
import { auth, signIn, signOut } from '@/auth';

// 30 (Signing in users Part 2)
// signIn() を使って、サーバーサイドで、email, password をもとに login します。
export async function signInUser(data: LoginSchema): Promise<ActionResult<string>> {
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

    // Auth.js は AuthError を提供しています。
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

// 35 (Adding a dropdown menu to the Nav bar Part 2)
// signOut() は server side であり、client side の component（UserMenu.tsx) では呼び出せないので、
// server action として設定する。
export async function signOutUser() {
  await signOut({ redirectTo: '/' });
}

// 141 (Submitting the form)
// RegisterForm.tsx で使用されます。form の情報をもとに新しい user を register(登録) します.
export async function registerUser(data: RegisterSchema): Promise<ActionResult<User>> {
  try {
    const validated = combineRegisterSchema.safeParse(data);

    if (!validated.success) {
      // ZodIssue[]
      return { status: 'error', error: validated.error.errors };
    }

    const { name, email, password, gender, description, dateOfBirth, city, country } = validated.data;

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // string
    if (existingUser) return { status: 'error', error: 'User already exists' };

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        member: {
          create: {
            name,
            description,
            city,
            country,
            dateOfBirth: new Date(dateOfBirth),
            gender,
          },
        },
      },
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

// 54 (Adding the like toggle function)
// userId が複数回必要になるので、メソッドを作ります。
export async function getAuthUserId() {
  const session = await auth();
  // auth.tsでidを設定しているので、session?.user?.idでログインしているユーザーのuserIdが取得できる。
  const userId = session?.user?.id;

  if (!userId) throw new Error('Unauthorized');

  return userId;
}
