import { Spinner } from '@nextui-org/react';

// 49 (Adding loading indicators)
// at the same level as the layout.tsx and the page.tsx
// members/[userid]/page.tsx, members/[userid]/chat/page.tsx, members/[userid]/photos/page.tsxを移動するたびに、loading.tsxを表示する。
const Loading = () => {
  return (
    <div className={'flex h-screen justify-center items-center'}>
      <Spinner label={'loading...'} color={'secondary'} labelColor={'secondary'} />
    </div>
  );
};

export default Loading;
