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
  const params = useParams<{ userId: string }>();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isSubmitting, isValid, errors },
  } = useForm<MessageSchema>({ resolver: zodResolver(messageSchema) });

  // useEffectの基本的な目的:
  // コンポーネントの副作用を処理するために使用されます。
  // 副作用とは、レンダリング以外の操作（データフェッチ、DOMの直接操作、タイマーの設定など）を指します。

  // useEffectの実行タイミング:
  // コンポーネントが最初にレンダリングされた後（マウント時）
  // 依存配列に指定された値が変更されたとき（更新時）
  // コンポーネントがアンマウントされる直前

  // このuseEffectは、コンポーネントが初回レンダリングされた直後に実行されます。
  // 目的は、フォームの'text'フィールドに自動的にフォーカスを設定することです。

  // なぜuseEffectが必要なのか:
  // Reactのレンダリングサイクル外で実行する必要がある操作だからです。
  // DOMの直接操作（この場合はフォーカスの設定）は、コンポーネントがレンダリングされてDOMに反映された後に行う必要があります。
  // useEffectを使用しないと、DOMがまだ準備できていない状態でフォーカスを設定しようとする可能性があります。

  // 依存配列 [setFocus] の意味:
  //
  // この配列に setFocus を指定することで、setFocus 関数が変更されたときにのみ useEffect が再実行されます。
  // 実際には setFocus は通常変更されないので、この useEffect は基本的に初回レンダリング時にのみ実行されます。

  // useEffect を使用しない場合の問題:
  // コンポーネントの本体で直接 setFocus('text') を呼び出すと、レンダリング中に副作用が発生し、予期しない動作やエラーを引き起こす可能性があります。
  useEffect(() => {
    setFocus('text');
  }, [setFocus]);

  const onSubmit = async (data: MessageSchema) => {
    //formに入力されたメッセージをparams.userIdが示すuserに送る。
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
        <Button
          type={'submit'}
          isIconOnly={true}
          color={'secondary'}
          radius={'full'}
          isLoading={isSubmitting}
          isDisabled={!isValid || isSubmitting}
        >
          <HiPaperAirplane size={18} />
        </Button>
      </div>
      <div className={'flex flex-col'}>
        {errors.root?.serverError && <p className={'text-danger text-sm'}>{errors.root.serverError.message}</p>}
      </div>
    </form>
  );
};

export default ChatForm;
