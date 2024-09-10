import { Button } from '@nextui-org/react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

// 150. Social Login part 1
const SocialLogin = () => {
  //
  const onClick = (provider: 'google' | 'github') => {
    signIn(provider, {
      callbackUrl: '/members',
    });
  };

  return (
    // 2つの <Button/> を横並びにします。
    <div className={'flex items-center w-full gap-2'}>
      <Button size={'lg'} fullWidth={true} variant={'bordered'} onClick={() => onClick('google')}>
        <FcGoogle size={24} />
      </Button>
      <Button size={'lg'} fullWidth={true} variant={'bordered'} onClick={() => onClick('github')}>
        <FaGithub size={24} />
      </Button>
    </div>
  );
};

export default SocialLogin;
