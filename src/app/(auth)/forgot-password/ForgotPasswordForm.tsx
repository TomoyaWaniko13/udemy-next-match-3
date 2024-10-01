'use client';

import { FieldValues, useForm } from 'react-hook-form';
import CardWrapper from '@/components/CardWrapper';
import { GiPadlock } from 'react-icons/gi';
import { ActionResult } from '@/types';
import { useState } from 'react';
import { generateResetPasswordEmail } from '@/app/actions/authActions';
import { Button, Input } from '@nextui-org/react';
import ResultMessage from '@/components/ResultMessage';

// 147. Adding the forgot password functionality part 2
// パスワードをリセットしたいときに、このフォームに email を入力して、リセットのプロセスを開始します。
const ForgotPasswordForm = () => {
  const [result, setResult] = useState<ActionResult<string> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm();

  // ForgotPasswordForm は一つの <Input/> しかないので、
  // わざわざ Zod の validation schema を使いません。
  const onSubmit = async (data: FieldValues) => {
    // generateResetPasswordEmail() は throw error となったときに null を返却します。
    const result: ActionResult<string> | null = await generateResetPasswordEmail(data.email);
    setResult(result);
    // フォームをリセットします。
    reset();
  };

  return (
    <CardWrapper
      headerIcon={GiPadlock}
      headerText={'Forgot password'}
      subHeaderText={'Please enter your email address and we will send you a link to reset your password'}
      body={
        <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col space-y-4'}>
          <Input type={'email'} placeholder={'Email address'} variant={'bordered'} defaultValue={''} {...register('email', { required: true })} />
          <Button type={'submit'} color={'secondary'} isLoading={isSubmitting} isDisabled={!isValid}>
            Send reset email
          </Button>
        </form>
      }
      footer={<ResultMessage result={result} />}
    />
  );
};

export default ForgotPasswordForm;
