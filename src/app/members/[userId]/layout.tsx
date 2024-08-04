import { getMemberByUserId } from '@/app/actions/memberActions';
import { ReactNode } from 'react';
import MemberSidebar from '@/app/members/MemberSidebar';
import { notFound } from 'next/navigation';
import { Card } from '@nextui-org/card';

// 47 (Using Next.js Layout pages)
const Layout = async ({ children, params }: { children: ReactNode; params: { userId: string } }) => {
  const member = await getMemberByUserId(params.userId);
  if (!member) return notFound();

  return (
    <div className={'grid grid-cols-12 gap-5 h-[80vh]'}>
      <div className={'col-span-3'}>
        <MemberSidebar member={member} />
      </div>
      <div className={'col-span-9'}>
        <Card className={'w-full mt-10 h-[80vh]'}>{children}</Card>
      </div>
    </div>
  );
};

export default Layout;
