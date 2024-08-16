import { getMemberByUserId } from '@/app/actions/memberActions';
import { notFound } from 'next/navigation';
import CardInnerWrapper from '@/components/CardInnerWrapper';

// 45 (Using dynamic routes in Next.js)
// 48 (Creating the Member detailed content)
// 81 (Creating a chat form)
const MemberDetailedPage = async ({ params }: { params: { userId: string } }) => {
  // getMemberByUserId()は server action
  const member = await getMemberByUserId(params.userId);
  if (!member) return notFound();

  return <CardInnerWrapper header={'Profile'} body={<div>{member.description}</div>} />;
};

export default MemberDetailedPage;
