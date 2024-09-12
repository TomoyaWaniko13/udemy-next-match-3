'use client';

import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { GiPadlock } from 'react-icons/gi';
import { Button, Input } from '@nextui-org/react';
import { useForm } from 'react-hook-form';
import { loginSchema, LoginSchema } from '@/lib/schemas/loginSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInUser } from '@/app/actions/authActions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import SocialLogin from '@/app/(auth)/login/SocialLogin';

// 30 (Signing in users Part 2)
// 31 (Adding notification toasts to the app)
// 146. Adding the forgot password functionality part 1
// 150. Social Login part 1

const LoginForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginSchema) => {
    const result = await signInUser(data);
    if (result.status === 'success') {
      router.push('/members');
      router.refresh();
    } else {
      toast.error(result.error as string);
    }
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
            <Button isLoading={isSubmitting} isDisabled={!isValid} fullWidth color={'secondary'} type={'submit'}>
              Login
            </Button>
            <SocialLogin />
            <div className={'flex justify-center hover:underline text-sm'}>
              <Link href={'/forgot-password'}>Forgot password?</Link>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default LoginForm;
