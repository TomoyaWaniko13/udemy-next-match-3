import { Card, CardBody, CardHeader } from '@nextui-org/card';

// 126 (Adding empty state)
const EmptyState = () => {
  return (
    // 中央にカードを配置します。
    <div className={'flex justify-center items-center mt-20'}>
      <Card className={'p-5'}>
        <CardHeader className={'text-3xl text-secondary'}>There are no results for this filter</CardHeader>
        <CardBody className={'text-center'}>Please select a different filter</CardBody>
      </Card>
    </div>
  );
};

export default EmptyState;
