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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      // 認可サーバーがクライアントを識別するために使用するIDです。
      clientId: process.env.GITHUB_CLIENT_ID,
      // クライアントと認可サーバーのみが知っている秘密情報で、
      // 安全に情報を共有するために使用されます。
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      // 以下で、どのように authentication をするのかを設定します。
      // email と password を使って login します。
      async authorize(credentials) {
        // email と password が loginSchema で指定された format か validate します。
        const validated = loginSchema.safeParse(credentials);

        // loginSchema.safeParse() による validation が成功の場合、
        if (validated.success) {
          const { email, password } = validated.data;

          // 提供された email でデータベースから user を取得します。
          const user = await getUserByEmail(email);

          // データベースに email で指定された user が存在しない場合、
          // OAuthを使ってログインしたためにuserのパスワードが存在しない場合、
          // もしくは 提供されたパスワードが データベースから取得した user のパスワードと異なる場合、
          // このアプリケーションに signIn することはできません。
          if (!user || !user.passwordHash || !(await compare(password, user.passwordHash))) {
            return null;
          }

          //
          return user;
        }

        // loginSchema.safeParse() による validation が成功でない場合、
        // このアプリケーションに signIn することはできません。
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
