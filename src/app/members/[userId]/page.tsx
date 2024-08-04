import { getMemberByUserId } from '@/app/actions/memberActions';
import { notFound } from 'next/navigation';

// 45 (Using dynamic routes in Next.js)
// When we use a layout page, this member detailed page is effectively
// going to be a child of this layout page.
// So we cannot pass this member to our layout.tsx page, but we're going to use
// our member sidebar on this, which needs access to the member. (47)
const MemberDetailedPage = async ({ params }: { params: { userId: string } }) => {
  // getMemberByUserId()は server action
  const member = await getMemberByUserId(params.userId);
  if (!member) return notFound();

  return <div>{member.name}</div>;
};

export default MemberDetailedPage;
