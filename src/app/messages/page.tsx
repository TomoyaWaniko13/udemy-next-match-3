import MessageSidebar from '@/app/messages/MessageSidebar';

const MessagesPage = () => {
  return (
    <div className={'grid grid-cols-10 gap-5 h-[80vh] mt-10'}>
      <div className={'col-span-2'}>
        <MessageSidebar />
      </div>
      <div className={'col-span-10'}>Message table goes here</div>
    </div>
  );
};

export default MessagesPage;
