import { getMemberByUserId } from '@/app/actions/memberActions';
import { notFound } from 'next/navigation';
import { CardBody, CardHeader } from '@nextui-org/card';
import { Divider } from '@nextui-org/react';

// 45 (Using dynamic routes in Next.js)
// 48 (Creating the Member detailed content)
const MemberDetailedPage = async ({ params }: { params: { userId: string } }) => {
  // getMemberByUserId()は server action
  const member = await getMemberByUserId(params.userId);
  if (!member) return notFound();

  return (
    <>
      <CardHeader className={'text-2xl font-semibold text-secondary'}>Profile</CardHeader>
      <Divider />
      <CardBody>{member.description}</CardBody>
    </>
  );
};

export default MemberDetailedPage;
