import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import authConfig from './auth.config';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// 33 (Using Auth.js callbacks)
// 151. Social Login part 2
// 158. Adding the role to the session data

// signIn() などは server side でしか呼ぶことができないので、authActions.ts で
// signIn() などを呼ぶ server action を作る必要があります。
export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    // This callback is called whenever a JSON Web Token is created (i.e. at sign in)
    // or updated (i.e whenever a session is accessed in the client).
    // https://next-auth.js.org/configuration/callbacks#jwt-callback
    async jwt({ user, token }) {
      if (user) {
        // console.log(user);

        // token に property を追加できます。
        // https://authjs.dev/guides/extending-the-session
        token.profileComplete = user.profileComplete;
        token.role = user.role;
      }
      // jwtなのでtokenをreturnします。
      return token;
    },

    // The session callback is called whenever a session is checked.
    // https://next-auth.js.org/configuration/callbacks#session-callback
    async session({ token, session }) {
      // console.log(token);
      // console.log(session);
      // token.sub は User の id と一致します。
      // session.user はログインしているユーザーの基本的な情報を含みます。
      // なので、この条件は User の idが存在しているかどうかと、 ユーザーがログインしているかどうか確認しています。
      if (token.sub && session.user) {
        // session に property を追加できます。
        // これで、session を取得すればログインしている user の id, profileComplete, role を取得できるようになります。
        // https://authjs.dev/guides/extending-the-session
        session.user.id = token.sub;
        session.user.profileComplete = token.profileComplete as boolean;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
});
