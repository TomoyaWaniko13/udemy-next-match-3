import Image from 'next/image';
import { Button } from '@nextui-org/react';
import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function Home() {
  // 32(Getting the session data)
  const session = await auth();

  return (
    <>
      {/* 32(Getting the session data) */}
      <h3 className={'text-2xl font-semibold'}>User session data</h3>
      {session ? (
        <div>
          <pre>{JSON.stringify(session, null, 2)}</pre>
          <form
            action={async () => {
              'use server';

              await signOut();
            }}
          >
            <Button type={'submit'} color={'primary'} variant={'bordered'}>
              Sign out
            </Button>
          </form>
        </div>
      ) : (
        <>Not signed in </>
      )}
    </>
  );
}
