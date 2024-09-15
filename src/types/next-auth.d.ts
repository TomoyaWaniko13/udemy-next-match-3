import { DefaultSession } from 'next-auth';

// 151. Social Login part 2
// 158. Adding the role to the session data

declare module 'next-auth' {
  interface User {
    profileComplete: boolean;
    role: Role;
  }

  // "Session の user プロパティは、profileComplete という boolean 型のプロパティを持ち、
  // さらに DefaultSession['user'] が持つすべてのプロパティも持つ" ということです。
  // DefaultSession にカーソルを合わせて、DefaultSession['user'] が持つすべてのプロパティ
  // を確認できます。
  interface Session {
    user: {
      profileComplete: boolean;
    } & DefaultSession['user'];
  }
}

// 151. Social Login part 2
declare module 'next-auth/jwt' {
  interface JWT {
    profileComplete: boolean;
    role: Role;
  }
}
