import { Spinner } from '@nextui-org/react';

// 59 (Using the useTransition hook for subtle loading)
const LoadingComponent = ({ label }: { label?: string }) => {
  return (
    <div className={'fixed inset-0 flex justify-center items-center'}>
      <Spinner label={label || 'Loading...'} color={'secondary'} labelColor={'secondary'} />
    </div>
  );
};

export default LoadingComponent;
