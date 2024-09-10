import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import authConfig from './auth.config';
import { prisma } from '@/lib/prisma';

// signIn() などは server side でしか呼ぶことができないので、authActions.ts で
// signIn() などを呼ぶ server action を作る必要があります。
export const { auth, handlers, signIn, signOut } = NextAuth({
  // 33 (Using Auth.js callbacks)
  callbacks: {
    // The session callback is called whenever a session is checked.
    // https://next-auth.js.org/configuration/callbacks
    async session({ token, session }) {
      // console.log(token);

      // {
      //   name: 'TomoyaWaniko13',
      //   email: 'alligatorfree12@gmail.com',
      //   picture: 'https://avatars.githubusercontent.com/u/144481877?v=4',
      //   sub: 'cm0w4csls000011kekjsbm4xd',
      //   iat: 1726006124,
      //   exp: 1728598124,
      //   jti: 'a83577fe-d358-45e7-9008-45bf030838b4'
      // }

      // console.log(session);

      // {
      //   user: {
      //     name: 'TomoyaWaniko13',
      //     email: 'alligatorfree12@gmail.com',
      //     image: 'https://avatars.githubusercontent.com/u/144481877?v=4'
      //   },
      //   expires: '2024-10-10T22:08:50.468Z'
      // }

      // token.sub は User の id と一致します。
      // session.user は　ログインしているユーザーの基本的な情報を含みます。
      // なので、この条件は User の id　が存在しているかどうかと、 ユーザーがログインしているかどうか確認しています。
      if (token.sub && session.user) {
        // session.user.id に token.sub (user の id)　をセットします。
        // これで、session を取得すればログインしている user の id　を取得できるようになります。
        session.user.id = token.sub;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
});
