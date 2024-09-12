import { DefaultSession } from 'next-auth';

// 151. Social Login part 2
declare module 'next-auth' {
  interface User {
    profileComplete: boolean;
  }

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
  }
}
