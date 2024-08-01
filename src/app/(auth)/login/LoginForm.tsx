'use client';

import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/card';
import { GiPadlock } from 'react-icons/gi';
import { Button, Input } from '@nextui-org/react';
import { useForm } from 'react-hook-form';
import { loginSchema, LoginSchema } from '@/lib/schemas/loginSchema';
import { zodResolver } from '@hookform/resolvers/zod';

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <Card className={'w-3/5 mx-auto'}>
      <CardHeader className={'flex flex-col items-center justify-center'}>
        <div className={'flex flex-col items-center gap-2'}>
          <GiPadlock size={30} />
          <h1 className={'text-xl font-semibold'}>Login</h1>
        </div>
        <p className={'text-neutral-600'}>Welcome back to NextMatch</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={'space-y-4'}>
            <Input
              label={'Email'}
              variant={'bordered'}
              {...register('email')}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message as string}
            />
            <Input
              label={'Password'}
              variant={'bordered'}
              type={'password'}
              {...register('password')}
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message as string}
            />
            <Button
              isDisabled={!isValid}
              fullWidth
              color={'secondary'}
              type={'submit'}
            >
              Login
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default LoginForm;
