import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import authConfig from './auth.config';
import { prisma } from '@/lib/prisma';

export const { auth, handlers, signIn, signOut } = NextAuth({
  // 33 (Using Auth.js callbacks)
  callbacks: {
    async session({ token, session }) {
      // token.subは userのid
      // session.userはuserがloginしているかどうか確認
      if (token.sub && session.user) {
        // session.user.idに token.sub(userのid)　をセット
        session.user.id = token.sub;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
});
