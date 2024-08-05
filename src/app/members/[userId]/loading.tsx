import { Spinner } from '@nextui-org/react';

// 49 (Adding loading indicators)
// at the same level as the layout.tsx and the page.tsx
const Loading = () => {
  return (
    <div className={'flex h-screen justify-center items-center'}>
      <Spinner label={'loading...'} color={'secondary'} labelColor={'secondary'} />
    </div>
  );
};

export default Loading;
