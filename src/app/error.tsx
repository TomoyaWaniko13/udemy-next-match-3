'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Card, CardBody, CardFooter, CardHeader, Button } from '@nextui-org/react';
import { BiSolidError } from 'react-icons/bi';

// 50 (Adding a custom error page)
// https://nextjs.org/docs/app/building-your-application/routing/error-handling
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={'flex items-center justify-center h-screen'}>
      <Card className={'w-2/5 mx-auto'}>
        <CardHeader className={'flex flex-col items-center justify-center'}>
          <div className={'flex flex-col gap-2 items-center text-secondary'}>
            <BiSolidError size={30} />
            <h1 className={'text-3xl font-semibold'}>Error</h1>
          </div>
        </CardHeader>
        <CardBody>
          <div className={'flex justify-center text-danger'}>{error.message}</div>
        </CardBody>
        <CardFooter className={'flex justify-center'}>
          <Button onClick={() => reset()} color={'secondary'} variant={'bordered'}>
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
