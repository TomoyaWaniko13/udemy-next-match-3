import { CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import { Divider } from '@nextui-org/react';
import { ReactNode } from 'react';

type Props = {
  // ReactNodeの場合、button componentが使われる。
  header: ReactNode | string;
  body: ReactNode;
  footer?: ReactNode;
};

// 81 (Creating a chat form)
// この構造を持ったpage.tsxが複数あるので、再利用できるようにするのが目的。
const CardInnerWrapper = ({ header, body, footer }: Props) => {
  return (
    <>
      <CardHeader>
        {typeof header === 'string' ? (
          <div className={'text-2xl font-semibold text-secondary'}>{header}</div>
        ) : (
          <>{header}</>
        )}
      </CardHeader>
      <Divider />
      <CardBody>{body}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </>
  );
};

export default CardInnerWrapper;
