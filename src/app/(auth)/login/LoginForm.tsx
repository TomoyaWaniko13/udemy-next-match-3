import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/card';
import { GiPadlock } from 'react-icons/gi';
import { Button, Input } from '@nextui-org/react';

const LoginForm = () => {
  return (
    <Card className={'w-2/5 mx-auto'}>
      <CardHeader className={'flex flex-col items-center justify-center'}>
        <div className={'flex flex-col items-center gap-2'}>
          <GiPadlock size={30} />
          <h1 className={'text-xl font-semibold'}>Login</h1>
        </div>
        <p className={'text-neutral-600'}>Welcome back to NextMatch</p>
      </CardHeader>
      <CardBody>
        <form action="">
          <div className={'space-y-4'}>
            <Input label={'Email'} variant={'bordered'} />
            <Input label={'Password'} variant={'bordered'} type={'password'} />
            <Button fullWidth color={'secondary'} type={'submit'}>
              Login
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default LoginForm;
