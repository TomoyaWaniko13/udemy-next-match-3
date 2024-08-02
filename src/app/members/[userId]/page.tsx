import { getMemberByUserId } from '@/app/actions/memberActions';
import { notFound } from 'next/navigation';

// 45 (Using dynamic routes in Next.js)
const MemberDetailedPage = async ({ params }: { params: { userId: string } }) => {
  // getMemberByUserId()は server action
  const member = await getMemberByUserId(params.userId);
  if (!member) return notFound();

  return <div>{member.name}</div>;
};

export default MemberDetailedPage;
