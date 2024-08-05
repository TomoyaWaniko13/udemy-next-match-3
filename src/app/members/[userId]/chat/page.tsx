import { CardBody, CardHeader } from '@nextui-org/card';
import { Divider } from '@nextui-org/react';

// 48 (Creating the Member detailed content)
const ChatPage = () => {
  return (
    <>
      <CardHeader className={'text-2xl font-semibold text-secondary'}>Chat</CardHeader>
      <Divider />
      <CardBody>Chat goes here</CardBody>
    </>
  );
};

export default ChatPage;
