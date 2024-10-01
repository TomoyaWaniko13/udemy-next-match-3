import type { NextAuthConfig } from 'next-auth';
import Credentials from '@auth/core/providers/credentials';
import { loginSchema } from '@/lib/schemas/loginSchema';
import { getUserByEmail } from '@/app/actions/authActions';
import { compare } from 'bcryptjs';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';

// 29 (Signing in users)
// 150. Social Login part 1
export default {
  providers: [
    // clientId: 認可サーバーがクライアントを識別するために使用するIDです。
    // clientSecret: クライアントと認可サーバーのみが知っている秘密情報で、安全に情報を共有するために使用されます。
    Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }),
    GitHub({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET }),
    Credentials({
      name: 'credentials',
      // 以下で、どのように authentication をするのかを設定します。email と password を使って login します。
      async authorize(credentials) {
        // email と password が loginSchema で指定された format か validate します。
        const validated = loginSchema.safeParse(credentials);

        if (validated.success) {
          const { email, password } = validated.data;

          const userByEmail = await getUserByEmail(email);

          // 1. userByEmail が存在しない場合、
          // 2. OAuthを使ってログインしたために userByEmail のパスワードが存在しない場合、
          // 3. 提供されたパスワードが データベースから取得した userByEmail のパスワードと異なる場合、
          // 以上のいずれかの場合、このアプリケーションに signIn することはできません。
          if (!userByEmail || !userByEmail.passwordHash || !(await compare(password, userByEmail.passwordHash))) return null;

          return userByEmail;
        }

        // loginSchema.safeParse() による validation が成功でない場合、
        // このアプリケーションに signIn することはできません。
        return null;
      }, // end of authorize()
    }),
  ],
} satisfies NextAuthConfig;
