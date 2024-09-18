import { auth } from '@/auth';
import { Button } from '@nextui-org/react';
import Link from 'next/link';

// 160. Getting the session info in the client
export default async function Home() {
  // 32 (Getting the session data)
  const session = await auth();

  return (
    <div className={'flex flex-col justify-center items-center mt-20 gap-6 text-secondary'}>
      <h1 className={'text-4xl font-bold'}>Welcome to NextMatch</h1>
      {session ? (
        <Button as={Link} href={'/members'} size={'lg'} color={'secondary'} variant={'bordered'}>
          Continue
        </Button>
      ) : (
        <div className={'flex flex-row gap-4'}>
          <Button as={Link} href={'/login'} size={'lg'} color={'secondary'} variant={'bordered'}>
            Sign in
          </Button>
          <Button as={Link} href={'/register'} size={'lg'} color={'secondary'} variant={'bordered'}>
            Register
          </Button>
        </div>
      )}
    </div>
  );
}
