import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import authConfig from './auth.config';
import { prisma } from '@/lib/prisma';

// signIn() などは server side でしか呼ぶことができないので、authActions.ts で
// signIn() などを呼ぶ server action を作る必要があります。
// 33 (Using Auth.js callbacks)
// 151. Social Login part 2
// 158. Adding the role to the session data
export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    // This callback is called whenever a JSON Web Token is created (i.e. at sign in)
    // or updated (i.e whenever a session is accessed in the client).
    // https://next-auth.js.org/configuration/callbacks#jwt-callback
    async jwt({ user, token }) {
      if (user) {
        // console.log(user);
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
        // session.user.id に token.sub (user の id) をセットします。
        // これで、session を取得すればログインしている user の id を取得できるようになります。
        session.user.id = token.sub;
        session.user.profileComplete = token.profileComplete as boolean;
        session.user.role = token.role;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
});
