'use client';

import { useForm } from 'react-hook-form';
import { MessageSchema } from '@/lib/schemas/messageSchema';
import { Button, Input } from '@nextui-org/react';
import { HiPaperAirplane } from 'react-icons/hi2';
import { useParams, useRouter } from 'next/navigation';
import { createMessage } from '@/app/actions/messageActions';
import { handleFormServerErrors } from '@/lib/util';

// 81 (Creating a chat form)
// 82 (Creating the send message action)
const ChatForm = () => {
  const router = useRouter();
  // userIdはdirectoryの名前と一致している必要がある。
  const params = useParams<{ userId: string }>();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isValid, errors },
  } = useForm<MessageSchema>();

  const onSubmit = async (data: MessageSchema) => {
    const result = await createMessage(params.userId, data);
    if (result.status === 'error') {
      handleFormServerErrors(result, setError);
    } else {
      reset();
      router.refresh();
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
