import { Spinner } from '@nextui-org/react';

// 59 (Using the useTransition hook for subtle loading)
const LoadingComponent = ({ label }: { label?: string }) => {
  return (
    // 中央に <Spinner/> を配置します。
    <div className={'fixed inset-0 flex justify-center items-center'}>
      {/* NextUIの Spinner について: https://nextui.org/docs/components/spinner */}
      <Spinner label={label || 'Loading...'} color={'secondary'} labelColor={'secondary'} />
    </div>
  );
};

export default LoadingComponent;
