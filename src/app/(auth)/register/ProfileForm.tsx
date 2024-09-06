'use client';

import { Input, Select, SelectItem, Textarea } from '@nextui-org/react';
import { useFormContext } from 'react-hook-form';
import { format, subYears } from 'date-fns';

// 140 (Adding a Register wizard Part 3)
const ProfileForm = () => {
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();

  const genderList = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  return (
    <div className={'space-y-4'}>
      {/* <Select/> の書き方について:  */}
      {/* https://nextui.org/docs/components/select */}
      <Select
        defaultSelectedKeys={getValues('gender')}
        label={'gender'}
        aria-label={'Select gender'}
        variant={'bordered'}
        {...register('gender')}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message as string}
        onChange={(event) => setValue('gender', event.target.value)}
      >
        {genderList.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
      {/* max property により 18歳以上となる生年月日しか登録できません。 */}
      <Input
        defaultValue={getValues('dateOfBirth')}
        label={'Date of birth'}
        max={format(subYears(new Date(), 18), 'yyyy-MM-dd')}
        type={'date'}
        variant={'bordered'}
        {...register('dateOfBirth')}
        isInvalid={!!errors.dateOfBirth}
        errorMessage={errors.dateOfBirth?.message as string}
      />
      <Textarea
        defaultValue={getValues('description')}
        label={'Description'}
        variant={'bordered'}
        {...register('description')}
        isInvalid={!!errors.description}
        errorMessage={errors.description?.message as string}
      />
      <Input
        defaultValue={getValues('city')}
        label={'City'}
        variant={'bordered'}
        {...register('city')}
        isInvalid={!!errors.city}
        errorMessage={errors.city?.message as string}
      />
      <Input
        defaultValue={getValues('country')}
        label={'Country'}
        variant={'bordered'}
        {...register('country')}
        isInvalid={!!errors.country}
        errorMessage={errors.country?.message as string}
      />
    </div>
  );
};

export default ProfileForm;
