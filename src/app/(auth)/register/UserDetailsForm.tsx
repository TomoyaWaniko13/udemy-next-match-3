import { Input } from '@nextui-org/react';
import { useFormContext } from 'react-hook-form';

// 138 (Adding a Register wizard part 1)
const UserDetailsForm = () => {
  // useFormContext() を使用することにより、form の状態を共有できます。
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={'space-y-4'}>
      <Input
        defaultValue={getValues('name')}
        label={'Name'}
        variant={'bordered'}
        {...register('name')}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message as string}
      />
      <Input
        defaultValue={getValues('email')}
        label={'Email'}
        variant={'bordered'}
        {...register('email')}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message as string}
      />
      <Input
        defaultValue={getValues('password')}
        label={'Password'}
        variant={'bordered'}
        type={'password'}
        {...register('password')}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message as string}
      />
    </div>
  );
};

export default UserDetailsForm;
