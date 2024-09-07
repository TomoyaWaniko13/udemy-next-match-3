'use client';

import { useRouter } from 'next/navigation';
import CardWrapper from '@/components/CardWrapper';
import { FaCheckCircle } from 'react-icons/fa';

// 141 (Submitting the form)
const RegisterSuccessPage = () => {
  const router = useRouter();

  return (
    <CardWrapper
      headerIcon={FaCheckCircle}
      subHeaderText={'You can now login to the app'}
      action={() => router.push('/login')}
      actionLabel={'Go to login'}
      headerText={'You have successfully registered'}
    />
  );
};

export default RegisterSuccessPage;
