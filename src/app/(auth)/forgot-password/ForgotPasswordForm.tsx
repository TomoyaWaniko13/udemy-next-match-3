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
  // result の値を他のコンポーネントに渡す必要があります。
  // なので、ここで変数を宣言します。
  const [result, setResult] = useState<ActionResult<string> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm();

  // ForgotPasswordForm は一つの <Input/> field しかないので、
  // わざわざ Zod の validation schema を使いません。
  const onSubmit = async (data: FieldValues) => {
    // result state の値が更新されます。成功か失敗を表す値です。
    setResult(await generateResetPasswordEmail(data.email));
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
          <Input
            type={'email'}
            placeholder={'Email address'}
            variant={'bordered'}
            defaultValue={''}
            {...register('email', { required: true })}
          />
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
