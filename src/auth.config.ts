import type { NextAuthConfig } from 'next-auth';
import Credentials from '@auth/core/providers/credentials';
import { loginSchema } from '@/lib/schemas/loginSchema';
import { getUserByEmail } from '@/app/actions/authActions';
import { compare } from 'bcryptjs';

export default {
  providers: [
    Credentials({
      // 29 (Signing in users)
      // emailとpasswordを使ってloginする。
      name: 'credentials',
      async authorize(creds) {
        const validated = loginSchema.safeParse(creds);

        if (validated.success) {
          const { email, password } = validated.data;
          // userを取得
          const user = await getUserByEmail(email);

          if (!user || !(await compare(password, user.passwordHash))) return null;

          return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
