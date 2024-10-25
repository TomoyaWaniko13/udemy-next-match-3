'use server';

import { combineRegisterSchema, ProfileSchema, RegisterSchema } from '@/lib/schemas/registerSchema';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ActionResult } from '@/types';
import { TokenType, User } from '@prisma/client';
import { LoginSchema } from '@/lib/schemas/loginSchema';
import { AuthError } from 'next-auth';
import { auth, signIn, signOut } from '@/auth';
import { generateToken, getTokenByToken } from '@/lib/tokens';
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/mail';
import { ZodIssue } from 'zod';

// 30 (Signing in users Part 2)
// 143. Creating the token functions
// 144. Adding an email provider

// documentation に従ってかきます:
// https://nextjs.org/docs/app/building-your-application/authentication#implementing-authentication
// Auth.js の signIn を使って、<LoginForm/> の入力情報の email, password をもとにログインします。
export async function signInUser(data: LoginSchema): Promise<ActionResult<string>> {
  const userByEmail = await getUserByEmail(data.email);

  // !existingUser.email の型チェックにより、userByEmail.email がnull である可能性を除外します。
  // このチェックがないと、のちに generateToken() に userByEmail.email を渡すときに、TypeScript の型チェックにより警告されます。
  if (!userByEmail || !userByEmail.email) return { status: 'error', error: 'Invalid credentials' };

  if (!userByEmail.emailVerified) {
    const token = await generateToken(userByEmail.email, TokenType.VERIFICATION);
    // Resend によって、ユーザーに認証リンクを含むメールが送信されます。
    await sendVerificationEmail(token.email, token.token);
    return { status: 'error', error: 'Please verify your email address before logging in' };
  }

  try {
    // Auth.js の signIn() はサーバーサイドでしか呼ぶことができないので、signIn() を呼ぶ server action を作る必要があります。
    // 'credentials' は、auth.config.ts の 'credentials' オプションで設定したやり方で authorization するということです。
    // sever action で redirection をするとエラーになるので、redirect: false とします。
    const result = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
    console.log(result);
    return { status: 'success', data: 'Logged in' };
    //
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

// signOut() は クライアントサイドのコンポーネント（UserMenu.tsx) では呼び出せないので、
// server action として使用する必要があります。
export async function signOutUser() {
  await signOut({ redirectTo: '/' });
}

// 141 (Submitting the form)
// 142 (Setting up tokens and resetting the Database)
// 143. Creating the token functions

// RegisterForm.tsx で使用されます。form の情報をもとに新しい user を register (登録) します.
export async function registerUser(data: RegisterSchema): Promise<ActionResult<User>> {
  try {
    //
    // form に入力された情報をサーバーサイドで検証します。
    // combineRegisterSchema は2つの form に入力された情報を扱います。
    const validated = combineRegisterSchema.safeParse(data);
    if (!validated.success) return { status: 'error', error: validated.error.errors as ZodIssue[] };

    // form に入力された情報の validation に問題がないならば、form に入力された情報を取得します。
    const { name, email, password, gender, description, dateOfBirth, city, country } = validated.data;

    // すでに email が他のユーザーによって使われているか確認します。
    const userByEmail = await prisma.user.findUnique({ where: { email } });
    if (userByEmail) return { status: 'error', error: 'User already exists' };

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        profileComplete: true,
        member: { create: { name, description, city, country, dateOfBirth: new Date(dateOfBirth), gender } },
      },
    });

    // generateToken 関数を呼び出して、メール検証用のトークンを生成してデータベースに保存します。
    // 同じメールアドレスに対する既存のトークンがあるかどうか確認するために、email を引数として受け取ります。
    const verificationToken = await generateToken(email, TokenType.VERIFICATION);
    // Resend によって、ユーザーに検証リンクを含むメールが送信されます。
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { status: 'success', data: user };
  } catch (error) {
    console.log(error);
    return { status: 'error', error: 'Something went wrong' };
  }
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

// 54 (Adding the like toggle function)

// 現在のユーザーの userId が複数回必要になるので、session をもとに
// 現在のユーザーの userId を取得できるメソッドを作ります。
export async function getAuthUserId() {
  // auth.ts で 現在のユーザーの userId を設定しているので、
  // session?.user?.id で現在のユーザーの userId を取得できます。
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Unauthorized');

  return userId;
}

// 145. Adding the verify email function
export async function verifyEmail(token: string): Promise<ActionResult<string>> {
  try {
    const tokenByToken = await getTokenByToken(token);
    if (!tokenByToken) return { status: 'error', error: 'Invalid token' };

    const hasExpired = new Date() > tokenByToken.expires;
    if (hasExpired) return { status: 'error', error: 'Token has expired' };

    const userByEmail = await getUserByEmail(tokenByToken.email);
    if (!userByEmail) return { status: 'error', error: 'User not found' };

    // tokenByToken が有効ならば、データベースの User model の emailVerified を現在の日付で更新します。
    await prisma.user.update({
      where: { id: userByEmail.id },
      data: { emailVerified: new Date() },
    });

    // User model の emailVerified を更新した後に、データベースから取得した token をデータベースから削除します。
    await prisma.token.delete({ where: { id: tokenByToken.id } });

    return { status: 'success', data: 'Success' };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 146. Adding the forgot password functionality part 1

// ユーザーがパスワードを忘れた場合や、セキュリティ上の理由でパスワードを変更したい場合に使用されます。
// ユーザーインターフェース側でこの action を呼び出すことで、パスワードリセットのプロセスを開始できます。
export async function generateResetPasswordEmail(email: string): Promise<ActionResult<string>> {
  try {
    const userByEmail = await getUserByEmail(email);
    if (!userByEmail) return { status: 'error', error: 'Email not found' };

    const token = await generateToken(email, TokenType.PASSWORD_RESET);

    // 生成されたトークンを使用して、Resend でパスワードリセット用のメールをユーザーに送信します。
    await sendPasswordResetEmail(token.email, token.token);

    return { status: 'success', data: 'Password reset email has been sent. Pleases check your emails' };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 148. Adding the forgot password functionality part 3

// ユーザーのパスワードを実際にリセット（更新）するための server action です。
// この関数は、ユーザーがパスワードリセットのリンクをクリックし、新しいパスワードを入力した後に呼び出されます。
export async function resetPassword(password: string, token: string | null): Promise<ActionResult<string>> {
  try {
    if (!token) return { status: 'error', error: 'Missing token' };

    const tokenByToken = await getTokenByToken(token);
    if (!tokenByToken) return { status: 'error', error: 'Invalid token' };

    const hasExpired = new Date() > tokenByToken.expires;
    if (hasExpired) return { status: 'error', error: 'Token has expired' };

    const userByEmail = await getUserByEmail(tokenByToken.email);
    if (!userByEmail) return { status: 'error', error: 'User not found' };

    const hashedPassword = await bcrypt.hash(password, 12);

    // トークン が有効であれば、password を更新します。
    await prisma.user.update({
      where: { id: userByEmail.id },
      data: { passwordHash: hashedPassword },
    });

    // 使用済みのリセットトークンをデータベースから削除します。
    await prisma.token.delete({ where: { id: tokenByToken.id } });

    return { status: 'success', data: 'Password updated successfully. Please try logging in' };
  } catch (error) {
    console.log(error);
    return { status: 'error', error: 'Something went wrong' };
  }
}

// 153. Adding a complete profile form for social login
export async function completeSocialLoginProfile(data: ProfileSchema): Promise<ActionResult<string>> {
  const session = await auth();
  if (!session?.user) return { status: 'error', error: 'User not found' };

  try {
    //
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // user の profileComplete を true に更新します。
        profileComplete: true,
        // session.user.id により指定された user のプロフィール情報を更新します。
        // Social login により、session から取得できる情報は sessionから取得します。
        // それ以外の情報は、form の入力情報である data から情報を取得します。
        member: {
          create: {
            name: session.user.name as string,
            image: session.user.image,
            gender: data.gender,
            dateOfBirth: new Date(data.dateOfBirth),
            description: data.description,
            city: data.city,
            country: data.country,
          },
        },
      },
      // 現在のユーザーの provider を取得するために、accounts を select します。
      select: { accounts: { select: { provider: true } } },
    });

    // user は user: { accounts: { provider: string }[] } という型なので、
    // user.accounts[0].provider で provider にアクセスできます。
    return { status: 'success', data: user.accounts[0].provider };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 162. Adding the photo moderation functionality part 2
// session から現在の user の role を取得します。
export async function getUserRole() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role) throw new Error('Not in role');
  return role;
}
