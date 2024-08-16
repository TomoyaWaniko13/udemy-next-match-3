import CardInnerWrapper from '@/components/CardInnerWrapper';
import ChatForm from '@/app/members/[userId]/chat/ChatForm';

// 48 (Creating the Member detailed content)
// 81 (Creating a chat form)
const ChatPage = () => {
  return <CardInnerWrapper header={'Chat'} body={<div>Chat goes here</div>} footer={<ChatForm />} />;
};

export default ChatPage;
