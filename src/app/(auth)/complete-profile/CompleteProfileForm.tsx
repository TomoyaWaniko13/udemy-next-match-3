'use client';

import { profileSchema, ProfileSchema } from '@/lib/schemas/registerSchema';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CardWrapper from '@/components/CardWrapper';
import { RiProfileLine } from 'react-icons/ri';
import { Button } from '@nextui-org/react';
import ProfileForm from '@/app/(auth)/register/ProfileForm';
import { completeSocialLoginProfile } from '@/app/actions/authActions';
import { signIn } from 'next-auth/react';
import { handleFormServerErrors } from '@/lib/util';

// 153. Adding a complete profile form for social login
const CompleteProfileForm = () => {
  //
  const useFormMethods = useForm<ProfileSchema>({ resolver: zodResolver(profileSchema), mode: 'onTouched' });

  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useFormMethods;

  const onSubmit = async (data: ProfileSchema) => {
    const result = await completeSocialLoginProfile(data);
    // result.data には どの provider を使っているかの情報が含まれています。
    if (result.status === 'success') {
      signIn(result.data, { callbackUrl: '/members' });
    } else {
      handleFormServerErrors(result, setError);
    }
  };

  return (
    <CardWrapper
      headerText={'Please complete your profile to continue to the app'}
      subHeaderText={'Please complete your profile to continue to the app'}
      headerIcon={RiProfileLine}
      body={
        <FormProvider {...useFormMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={'space-y-4'}>
              <ProfileForm />
              {errors.root?.serverError && <p className={'text-danger text-sm'}>{errors.root.serverError.message}</p>}
              <div className={'flex flex-row items-center gap-6'}>
                <Button isLoading={isSubmitting} isDisabled={!isValid} fullWidth={true} color={'secondary'} type={'submit'}>
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      }
    />
  );
};

export default CompleteProfileForm;
