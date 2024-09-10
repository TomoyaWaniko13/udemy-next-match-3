import type { NextAuthConfig } from 'next-auth';
import Credentials from '@auth/core/providers/credentials';
import { loginSchema } from '@/lib/schemas/loginSchema';
import { getUserByEmail } from '@/app/actions/authActions';
import { compare } from 'bcryptjs';
import GitHub from '@auth/core/providers/github';

// 29 (Signing in users)
// 150. Social Login part 1
export default {
  providers: [
    GitHub({
      // 認可サーバーがクライアントを識別するために使用するIDです。
      clientId: process.env.GITHUB_CLIENT_ID,
      // クライアントと認可サーバーのみが知っている秘密情報で、安全に情報を共有するために使用されます。
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      // email と password を使って login します。
      name: 'credentials',
      async authorize(creds) {
        const validated = loginSchema.safeParse(creds);

        if (validated.success) {
          const { email, password } = validated.data;
          // userを取得
          const user = await getUserByEmail(email);

          if (!user || !user.passwordHash || !(await compare(password, user.passwordHash))) {
            return null;
          }

          return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
