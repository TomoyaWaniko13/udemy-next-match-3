import CardInnerWrapper from '@/components/CardInnerWrapper';
import ChatForm from '@/app/members/[userId]/chat/ChatForm';
import { getMessageThread } from '@/app/actions/messageActions';
import { getAuthUserId } from '@/app/actions/authActions';
import MessageList from '@/app/members/[userId]/chat/MessageList';
import { createChatId } from '@/lib/util';
import { MessageDto } from '@/types';

// 48 (Creating the Member detailed content)
// 81 (Creating a chat form)
// 83 (Getting the message thread)
// 85 (Displaying the messages )
// 99 (Receiving the live messages)
// 114 (Updating the count based on the event)

const ChatPage = async ({ params }: { params: { userId: string } }) => {
  const userId = await getAuthUserId();
  const messages: { messages: MessageDto[]; readCount: number } = await getMessageThread(params.userId);
  const chatId = createChatId(userId, params.userId);

  return (
    <CardInnerWrapper
      header={'Chat'}
      body={<MessageList initialMessages={messages} currentUserId={userId} chatId={chatId} />}
      footer={<ChatForm />}
    />
  );
};

export default ChatPage;
