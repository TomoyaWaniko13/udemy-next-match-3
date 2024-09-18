'use client';

import { useState } from 'react';
import { ActionResult } from '@/types';
import { useForm } from 'react-hook-form';
import { resetPassword } from '@/app/actions/authActions';
import CardWrapper from '@/components/CardWrapper';
import { GiPadlock } from 'react-icons/gi';
import { Button, Input } from '@nextui-org/react';
import ResultMessage from '@/components/ResultMessage';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema, resetPasswordSchema } from '@/lib/schemas/resetPasswordSchema';
import { useSearchParams } from 'next/navigation';

// 148. Adding the forgot password functionality part 3
// mail.ts の sendPasswordResetEmail() により、token 文字列を query parameter に設定したリンクが、
// パスワードをリセットしたいユーザーに送られます。 そのリンクをクリックすると、この form が表示されます。
// この form にパスワードを入力すると、resetPassword() により新しいパスワードを設定できます。
const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ActionResult<string> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordSchema>({
    mode: 'onTouched',
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    // resetPassword()で、 token が有効であれば新しいパスワードに更新します。
    // result state の値が更新されます。パスワードの更新が成功か失敗を表す値です。
    setResult(await resetPassword(data.password, searchParams.get('token')));
    // フォームをリセットします。
    reset();
  };

  return (
    <CardWrapper
      headerIcon={GiPadlock}
      headerText={'Reset password'}
      subHeaderText={'Enter your password below'}
      body={
        <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col space-y-4'}>
          <Input
            type={'password'}
            placeholder={'Password'}
            variant={'bordered'}
            defaultValue={''}
            {...register('password')}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message as string}
          />
          <Input
            type={'password'}
            placeholder={'Confirm  Password'}
            variant={'bordered'}
            defaultValue={''}
            {...register('confirmPassword')}
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message as string}
          />
          <Button type={'submit'} color={'secondary'} isLoading={isSubmitting} isDisabled={!isValid}>
            Reset password
          </Button>
        </form>
      }
      footer={<ResultMessage result={result} />}
    />
  );
};

export default ResetPasswordForm;
