import { getMemberByUserId } from '@/app/actions/memberActions';
import { ReactNode } from 'react';
import MemberSidebar from '@/app/members/MemberSidebar';
import { notFound } from 'next/navigation';
import { Card } from '@nextui-org/card';
import { getAuthUserId } from '@/app/actions/authActions';

// 62 (Adding the edit member route)
const Layout = async ({ children }: { children: ReactNode }) => {
  const userId = await getAuthUserId();
  // userIdをもとに Memberを取得する server action
  const member = await getMemberByUserId(userId);
  if (!member) return notFound();

  const basePath = `/members/edit`;
  const navLinks = [
    { name: 'Edit profile', href: `${basePath}` },
    { name: 'Update Photos', href: `${basePath}/photos` },
  ];

  return (
    <div className={'grid grid-cols-12 gap-5 h-[80vh]'}>
      {/* <MemberSidebar/> を左に表示します。 */}
      <div className={'col-span-3'}>
        <MemberSidebar member={member} navLinks={navLinks} />
      </div>
      <div className={'col-span-9'}>
        <Card className={'w-full mt-10 h-[80vh]'}>{children}</Card>
      </div>
    </div>
  );
};

export default Layout;
