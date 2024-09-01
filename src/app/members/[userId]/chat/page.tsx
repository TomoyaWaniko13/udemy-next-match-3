import CardInnerWrapper from '@/components/CardInnerWrapper';
import ChatForm from '@/app/members/[userId]/chat/ChatForm';
import { getMessageThread } from '@/app/actions/messageActions';
import MessageBox from '@/app/members/[userId]/chat/MessageBox';
import { getAuthUserId } from '@/app/actions/authActions';
import MessageList from '@/app/members/[userId]/chat/MessageList';
import { createChatId } from '@/lib/util';

// 48 (Creating the Member detailed content)
// 81 (Creating a chat form)
// 83 (Getting the message thread)
// 85 (Displaying the messages )
// 99 (Receiving the live messages)
// 114 (Updating the count based on the event)

const ChatPage = async ({ params }: { params: { userId: string } }) => {
  // getAuthUserId()で現在ログインしているユーザーのIDを取得します。
  const userId = await getAuthUserId();
  // 特定の2人のユーザー間のメッセージスレッドを取得するためのserver action.
  const messages = await getMessageThread(params.userId);
  // 1つ目のuserIdはloginしているユーザーのuerId.
  // 2つ目のparams.userIdはメッセージを送信する相手のuserId.
  // createChatId()で一意のIDを生成します。
  // このIDはchannelの名前を表します。
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
