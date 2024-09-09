'use server';

import { combineRegisterSchema, registerSchema, RegisterSchema } from '@/lib/schemas/registerSchema';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ActionResult } from '@/types';
import { TokenType, User } from '@prisma/client';
import { LoginSchema } from '@/lib/schemas/loginSchema';

import { AuthError } from 'next-auth';
import { auth, signIn, signOut } from '@/auth';
import { generateToken, getTokenByToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

// 30 (Signing in users Part 2)
// 143. Creating the token functions
// 144. Adding an email provider

// signIn() を使って、サーバーサイドで、email, password をもとに login します。
export async function signInUser(data: LoginSchema): Promise<ActionResult<string>> {
  // email を使って User を取得します。
  const existingUser = await getUserByEmail(data.email);

  // もし getUserByEmail(data.email) において、data.email が null/undefined で データベースの User の email property も
  // null/undefined の場合、User が取得できてしまいます。なので、email property の値が存在するか確認するために、
  // !existingUser.email の条件も必要です。
  if (!existingUser || !existingUser.email) {
    // このメッセージを toast で表示します。
    return { status: 'error', error: 'Invalid credentials' };
  }

  // email が認証されているチェックします。
  if (!existingUser.emailVerified) {
    // email が認証されていない場合、トークンを作成して、
    const token = await generateToken(existingUser.email, TokenType.VERIFICATION);
    // ユーザーに認証リンクを含むメールが送信されます。
    await sendVerificationEmail(token.email, token.token);
    // このメッセージを toast で表示します。
    return { status: 'error', error: 'Please verify your email address before logging in' };
  }

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

    //  AuthError は Auth.js によって提供されています。
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
// 142 (Setting up tokens and resetting the Database)
// 143. Creating the token functions

// RegisterForm.tsx で使用されます。form の情報をもとに新しい user を register (登録) します.
export async function registerUser(data: RegisterSchema): Promise<ActionResult<User>> {
  try {
    // form に入力された情報をサーバーサイドで検証します。
    // combineRegisterSchema は2つの form に入力された情報を扱います。
    const validated = combineRegisterSchema.safeParse(data);

    if (!validated.success) {
      // ZodIssue[]
      return { status: 'error', error: validated.error.errors };
    }

    // form で入力された情報です。
    const { name, email, password, gender, description, dateOfBirth, city, country } = validated.data;

    // パスワードをデータベースに保存するときは hash() します。
    const hashedPassword = await bcrypt.hash(password, 12);

    // すでに email が他のユーザーによって使われているか確認します。
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    //  すでに email が使われている場合、エラーメッセージを表示します。
    if (existingUser) {
      // このメッセージが toast で表示されます。
      return { status: 'error', error: 'User already exists' };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        profileComplete: true,
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

    // この行では、generateToken 関数を呼び出して、メール検証用のトークンを生成しています。
    // 同じメールアドレスに対する既存のトークンがあるかどうか確認するために、email を引数として受け取ります。
    const verificationToken = await generateToken(email, TokenType.VERIFICATION);

    // ユーザーに検証リンクを含むメールが送信されます。
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

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

// 145. Adding the verify email function
export async function verifyEmail(token: string): Promise<ActionResult<string>> {
  try {
    const existingToken = await getTokenByToken(token);

    if (!existingToken) {
      return { status: 'error', error: 'Invalid token' };
    }

    const hasExpired = new Date() > existingToken.expires;

    if (hasExpired) {
      return { status: 'error', error: 'Token has expired' };
    }
    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
      return { status: 'error', error: 'User not found' };
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { emailVerified: new Date() },
    });

    await prisma.token.delete({ where: { id: existingToken.id } });

    return { status: 'success', data: 'Success' };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
