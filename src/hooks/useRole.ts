import { useSession } from 'next-auth/react';

// 162. Adding the photo moderation functionality part 2

export const useRole = () => {
  const session = useSession();

  return session.data?.user?.role;
};
