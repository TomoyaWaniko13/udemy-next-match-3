'use client';

import { useForm } from 'react-hook-form';
import { messageSchema, MessageSchema } from '@/lib/schemas/messageSchema';
import { Button, Input } from '@nextui-org/react';
import { HiPaperAirplane } from 'react-icons/hi2';
import { useParams, useRouter } from 'next/navigation';
import { createMessage } from '@/app/actions/messageActions';
import { handleFormServerErrors } from '@/lib/util';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

// 81 (Creating a chat form)
// 82 (Creating the send message action)
// 87 (Improving the message box)

// メッセージスレッドの入力欄を出力します。
const ChatForm = () => {
  const router = useRouter();
  // useParams は Next.js のフックの1つです。このフックを使用すると、現在のURLのダイナミックルートパラメータにアクセスできます。
  // userIdはdirectoryの名前と一致している必要があります。
  const params: { userId: string } = useParams<{ userId: string }>();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isSubmitting, isValid, errors },
  } = useForm<MessageSchema>({ resolver: zodResolver(messageSchema) });

  useEffect(() => {
    setFocus('text');
  }, [setFocus]);

  const onSubmit = async (data: MessageSchema) => {
    const result = await createMessage(params.userId, data);

    if (result.status === 'error') {
      handleFormServerErrors(result, setError);
    } else {
      reset();
      router.refresh();
      // フォームのリセットとDOM更新が確実に完了した後にフォーカスを設定します。
      // 50ミリ秒の遅延は、ブラウザがDOMを更新し、新しい空のフィールドを正しくレンダリングする時間を与えます。
      // フォームのリセットとDOMの更新が非同期で行われる可能性があります。
      // setTimeoutを使用することで、これらの処理が完了するのを待ってからフォーカスを設定します。
      setTimeout(() => setFocus('text'), 50);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={'w-full'}>
      <div className={'flex items-center gap-2'}>
        <Input
          fullWidth={true}
          placeholder={'Type a message'}
          variant={'faded'}
          {...register('text')}
          isInvalid={!!errors.text}
          errorMessage={errors.text?.message}
        />
        <Button type={'submit'} isIconOnly={true} color={'secondary'} radius={'full'} isLoading={isSubmitting} isDisabled={!isValid || isSubmitting}>
          <HiPaperAirplane size={18} />
        </Button>
      </div>
      <div className={'flex flex-col'}>{errors.root?.serverError && <p className={'text-danger text-sm'}>{errors.root.serverError.message}</p>}</div>
    </form>
  );
};

export default ChatForm;
