'use client';

import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { GiPadlock } from 'react-icons/gi';
import { Button } from '@nextui-org/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, RegisterSchema, registerSchema } from '@/lib/schemas/registerSchema';
import UserDetailsForm from '@/app/(auth)/register/UserDetailsForm';
import { useState } from 'react';
import ProfileForm from '@/app/(auth)/register/ProfileForm';
import { registerUser } from '@/app/actions/authActions';
import { handleFormServerErrors } from '@/lib/util';
import { useRouter } from 'next/navigation';

// 29 (Handling errors in the form Part 2)
// 65 (Adding the server action to update the member)
// 138 (Adding a Register wizard part 1)
// 139 (Adding a Register wizard Part 2)
// 141 (Submitting the form)

// step(段階) によって、使う schema を変更します。
const stepSchemas = [registerSchema, profileSchema];

const RegisterForm = () => {
  const router = useRouter();

  // form は 2段階(2 steps) あるので、その状態を管理します。 0 から始めます。
  const [activeStep, setActiveStep] = useState(0);
  // step(段階) によって、使う schema を変更します。
  const currentValidationSchema = stepSchemas[activeStep];

  // この "methods" variable を <FormProvider/> にパスする必要があります。
  const methods = useForm<RegisterSchema>({
    // step(段階) によって、使う schema を変更します。
    resolver: zodResolver(currentValidationSchema),
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = methods;

  const onSubmit = async () => {
    const result = await registerUser(getValues());

    if (result.status === 'success') {
      router.push('/register/success');
    } else {
      handleFormServerErrors(result, setError);
    }
  };

  // step(段階) によって、使う form を変更します。
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <UserDetailsForm />;
      case 1:
        return <ProfileForm />;
      default:
        return 'Unknown';
    }
  };

  const onBack = () => {
    setActiveStep((prevState) => prevState - 1);
  };

  const onNext = async () => {
    // 現在の step(active step) が stepSchemas 配列の最後の index と同じ値の時、最後の step です。
    if (activeStep === stepSchemas.length - 1) {
      await onSubmit();
    } else {
      setActiveStep((prevState) => prevState + 1);
    }
  };

  return (
    <Card className={'w-3/5 mx-auto'}>
      <CardHeader className={'flex flex-col items-center justify-center'}>
        <div className={'flex flex-col items-center gap-2'}>
          <GiPadlock size={30} />
          <h1 className={'text-xl font-semibold'}>Register</h1>
        </div>
        <p className={'text-neutral-600'}>Welcome to NextMatch</p>
      </CardHeader>
      <CardBody>
        {/* react hook form の <FromProvider/> で囲むことにより、状態を共有できるようになります。*/}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onNext)}>
            <div className={'space-y-4'}>
              {/* step(段階) によって、使う form を変更します。*/}
              {getStepContent(activeStep)}
              {/* 29 (Handling errors in the form Part 2) */}
              {errors.root?.serverError && <p className={'text-danger text-sm'}>{errors.root.serverError.message}</p>}
              {/* 横並びにします。 */}
              <div className={'flex flex-row items-center gap-6'}>
                {/* 最初の step でなければ、back button が必要です。 */}
                {activeStep !== 0 && (
                  <Button onClick={onBack} fullWidth={true}>
                    Back
                  </Button>
                )}
                <Button
                  isLoading={isSubmitting}
                  isDisabled={!isValid}
                  fullWidth={true}
                  color={'secondary'}
                  type={'submit'}
                >
                  {/* 現在の step(= active step) が stepSchemas 配列の最後の index と同じ値の時、最後の step です。*/}
                  {activeStep === stepSchemas.length - 1 ? 'Submit' : 'Continue'}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </CardBody>
    </Card>
  );
};

export default RegisterForm;
