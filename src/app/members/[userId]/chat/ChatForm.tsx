'use client';

import { useForm } from 'react-hook-form';
import { MessageSchema } from '@/lib/schemas/messageSchema';
import { Button, Input } from '@nextui-org/react';
import { HiPaperAirplane } from 'react-icons/hi2';

// 81 (Creating a chat form)
const ChatForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, errors },
  } = useForm<MessageSchema>();

  const onSubmit = (data: MessageSchema) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={'w-full flex items-center gap-2'}>
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
    </form>
  );
};

export default ChatForm;
