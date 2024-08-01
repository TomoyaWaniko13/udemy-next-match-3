'use client';

import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/card';
import { GiPadlock } from 'react-icons/gi';
import { Button, Input } from '@nextui-org/react';
import { useForm } from 'react-hook-form';

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm();

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
              {...register('email', { required: 'Email is required' })}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message as string}
            />
            <Input
              label={'Password'}
              variant={'bordered'}
              type={'password'}
              {...register('password', { required: 'Password is required' })}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message as string}
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
