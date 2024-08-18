import CardInnerWrapper from '@/components/CardInnerWrapper';
import ChatForm from '@/app/members/[userId]/chat/ChatForm';
import { getMessageThread } from '@/app/actions/messageActions';

// 48 (Creating the Member detailed content)
// 81 (Creating a chat form)
// 83 (Getting the message thread)
const ChatPage = async ({ params }: { params: { userId: string } }) => {
  // 特定の2人のユーザー間のメッセージスレッドを取得するためのserver action.
  const messages = await getMessageThread(params.userId);
  console.log(messages);

  return <CardInnerWrapper header={'Chat'} body={<div>Chat goes here</div>} footer={<ChatForm />} />;
};

export default ChatPage;
