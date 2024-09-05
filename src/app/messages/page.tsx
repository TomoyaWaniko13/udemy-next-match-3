import MessageSidebar from '@/app/messages/MessageSidebar';
import { getMessagesByContainer } from '@/app/actions/messageActions';
import MessageTable from '@/app/messages/MessageTable';

// 88 (Adding the message sidebar)
// 89 (Creating the fetch messages action)
// 133 (Cursor based pagination Part 3)
const MessagesPage = async ({ searchParams }: { searchParams: { container: string } }) => {
  // parameter は <MessageSidebar/> で設定されるので、それを取得する。
  const { messages, nextCursor } = await getMessagesByContainer(searchParams.container);

  return (
    <div className={'grid grid-cols-12 gap-5 h-[80vh] mt-10'}>
      <div className={'col-span-2'}>
        <MessageSidebar />
      </div>
      <div className={'col-span-10'}>
        <MessageTable initialMessages={messages} nextCursor={nextCursor} />
      </div>
    </div>
  );
};

export default MessagesPage;
