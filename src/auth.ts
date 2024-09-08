import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import authConfig from './auth.config';
import { prisma } from '@/lib/prisma';

export const { auth, handlers, signIn, signOut } = NextAuth({
  // 33 (Using Auth.js callbacks)
  callbacks: {
    async session({ token, session }) {
      // token.sub は user の id があるかどうか、
      // session.user は user が login しているかどうか確認しています。
      if (token.sub && session.user) {
        // session.user.id に token.sub(userのid)　をセットします。
        session.user.id = token.sub;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
});
