import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import { GiPadlock } from 'react-icons/gi';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { Button } from '@nextui-org/react';

type Props = {
  headerIcon: IconType;
  headerText: string;
  subHeaderText?: string;
  body?: ReactNode;
  action?: () => void;
  actionLabel?: string;
};

// 141 (Submitting the form)
// <Card/> component を再利用できるようにしています。
// headerIcon はそのままコンポーネントとなるので、大文字で始まる名前に変更します。
const CardWrapper = ({ body, headerIcon: Icon, headerText, subHeaderText, action, actionLabel }: Props) => {
  return (
    <div className={'flex items-center justify-center h-screen'}>
      <Card className={'w-3/5 mx-auto p-5'}>
        <CardHeader className={'flex flex-col items-center justify-center'}>
          <div className={'flex flex-col items-center gap-2 text-secondary'}>
            <Icon size={30} />
            <h1 className={'text-xl font-semibold'}>{headerText}</h1>
          </div>
          {subHeaderText && <p className={'text-neutral-600'}>{subHeaderText}</p>}
        </CardHeader>
        {body && <CardBody>{body}</CardBody>}
        <CardFooter>
          {action && (
            <Button onClick={action} fullWidth={true} color={'secondary'} variant={'bordered'}>
              {actionLabel}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CardWrapper;
