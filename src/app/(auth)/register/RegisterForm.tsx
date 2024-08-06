'use client';

import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { GiPadlock } from 'react-icons/gi';
import { Button, Input } from '@nextui-org/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, registerSchema } from '@/lib/schemas/registerSchema';
import { registerUser } from '@/app/actions/authActions';
import { handleFormServerErrors } from '@/lib/util';

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterSchema) => {
    // registerUser() は　server action.
    const result = await registerUser(data);

    // 29 (Handling errors in the form Part 2)
    if (result.status === 'success') {
      console.log('User registered successfully');
    } else {
      // 65 (Adding the server action to update the member)
      handleFormServerErrors(result, setError);
    }
  };

  return (
    <Card className={'w-3/5 mx-auto'}>
      <CardHeader className={'flex flex-col items-center justify-center'}>
        <div className={'flex flex-col items-center gap-2'}>
          <GiPadlock size={30} />
          <h1 className={'text-xl font-semibold'}>Register</h1>
        </div>
        <p className={'text-neutral-600'}>Welcome to NextMatch</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={'space-y-4'}>
            <Input
              label={'Name'}
              variant={'bordered'}
              {...register('name')}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message as string}
            />
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
            {/* 29(Handling errors in the form Part 2) */}
            {errors.root?.serverError && <p className={'text-danger text-sm'}>{errors.root.serverError.message}</p>}
            <Button isLoading={isSubmitting} isDisabled={!isValid} fullWidth color={'secondary'} type={'submit'}>
              Register
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default RegisterForm;
