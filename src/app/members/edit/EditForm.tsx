'use client';

import { Member } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { MemberEditSchema, memberEditSchema } from '@/lib/schemas/memberEditSchema';
import { useForm } from 'react-hook-form';
import { Button, Input, Textarea } from '@nextui-org/react';
import { useEffect } from 'react';
import { updateMemberProfile } from '@/app/actions/userActions';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { handleFormServerErrors } from '@/lib/util';

type Props = {
  member: Member;
};

// 63 (Adding the edit member form)
// 64 (Adding the edit member form Part 2)
// 65 (Adding the server action to update the member)
const EditForm = ({ member }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isValid, isDirty, isSubmitting, errors },
  } = useForm<MemberEditSchema>({
    resolver: zodResolver(memberEditSchema),
    mode: 'onTouched',
  });

  // コンポーネントが最初にマウントされたとき、またはmemberプロップが変更されたときに、フォームのフィールドをmemberオブジェクトの現在の値で初期化します。
  useEffect(() => {
    if (member) {
      // reset関数を使用してフォームをリセットすることで、ユーザーが行った変更を破棄し、元のmemberデータに戻すことができます。
      // 外部から渡されたmemberデータとフォームの状態を同期させます。これにより、ユーザーは常に最新のデータから編集を始めることができます。
      reset({
        name: member.name,
        description: member.description,
        city: member.city,
        country: member.country,
      });
    }
    // [member, reset]という依存配列を指定することで、memberデータまたはreset関数が変更された場合にのみこのeffectが再実行されます。
    // これにより、不要な再レンダリングを防ぎ、パフォーマンスを最適化しています。
  }, [member, reset]);

  // 65 (Adding the server action to update the member)
  const onSubmit = async (data: MemberEditSchema) => {
    // EditForm.tsxからのデータをvalidateしてMemberの情報を更新するserver action.
    const result = await updateMemberProfile(data);

    if (result.status === 'success') {
      toast.success('Profile updated');
      router.refresh();
      // databaseでprofileをアップデートした後、formに入力されているデータの値もアップデートしたdataの値にする。
      reset({ ...data });
    } else {
      handleFormServerErrors(result, setError);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col space-y-4'}>
      <Input
        label={'Name'}
        variant={'bordered'}
        {...register('name')}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
      />
      <Textarea
        label={'Description'}
        variant={'bordered'}
        {...register('description')}
        isInvalid={!!errors.description}
        errorMessage={errors.description?.message}
        minRows={6}
      />
      <div className={'flex flex-row gap-3'}>
        <Input
          label={'City'}
          variant={'bordered'}
          {...register('city')}
          isInvalid={!!errors.city}
          errorMessage={errors.city?.message}
        />
        <Input
          label={'Country'}
          variant={'bordered'}
          {...register('country')}
          isInvalid={!!errors.country}
          errorMessage={errors.country?.message}
        />
      </div>
      <Button
        type={'submit'}
        className={'flex self-end'}
        variant={'solid'}
        isDisabled={!isValid || !isDirty}
        isLoading={isSubmitting}
        color={'secondary'}
      >
        Update profile
      </Button>
    </form>
  );
};

export default EditForm;
