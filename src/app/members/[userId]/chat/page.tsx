import CardInnerWrapper from '@/components/CardInnerWrapper';
import ChatForm from '@/app/members/[userId]/chat/ChatForm';
import { getMessageThread } from '@/app/actions/messageActions';
import MessageBox from '@/app/members/[userId]/chat/MessageBox';
import { getAuthUserId } from '@/app/actions/authActions';

// 48 (Creating the Member detailed content)
// 81 (Creating a chat form)
// 83 (Getting the message thread)
// 85 (Displaying the messages )
const ChatPage = async ({ params }: { params: { userId: string } }) => {
  const userId = await getAuthUserId();
  // 特定の2人のユーザー間のメッセージスレッドを取得するためのserver action.
  const messages = await getMessageThread(params.userId);
  const body = (
    <div>
      {messages.length === 0 ? (
        'No messages to display.'
      ) : (
        <div>
          {messages.map((message) => (
            <MessageBox key={message.id} message={message} currentUserId={userId} />
          ))}
        </div>
      )}
    </div>
  );

  return <CardInnerWrapper header={'Chat'} body={body} footer={<ChatForm />} />;
};

export default ChatPage;
