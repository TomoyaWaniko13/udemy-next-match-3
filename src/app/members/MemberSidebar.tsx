'use client';

import { Member } from '@prisma/client';
import { Button, Card, Divider, Image } from '@nextui-org/react';
import { CardBody, CardFooter } from '@nextui-org/card';
import { calculateAge, transformImageUrl } from '@/lib/util';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PresenceDot from '@/components/PresenceDot';

type Props = {
  member: Member;
  // edit/layout.tsxと[userId]/layout.tsxには、異なるnavLinksを使う。
  navLinks: { name: string; href: string }[];
};

// 46 (Adding a Sidebar for the Member detailed page)
// 62 (Adding the edit member route)
// 77 (Tidying up the images)
// 107 (Displaying presence in other components)
// /members page で左側に配置するサイドバーです。
const MemberSidebar = ({ member, navLinks }: Props) => {
  const pathname = usePathname();

  return (
    <Card className={'w-full mt-10 items-center h-[80vh]'}>
      <Image
        height={200}
        width={200}
        src={transformImageUrl(member.image) || '/images/user.png'}
        alt={'User profile main image'}
        className={'rounded-full mt-6 aspect-square object-cover'}
      />
      {/* scroll barを表示させないために、'overflow-hidden'　を使います。 */}
      <CardBody className={'overflow-hidden'}>
        <div className={'flex flex-col items-center'}>
          <div className={'flex'}>
            <div className={'text-2xl'}>
              {member.name}, {calculateAge(member.dateOfBirth)}
            </div>
            <div>
              {/* 107 (Displaying presence in other components) */}
              <PresenceDot member={member} />
            </div>
          </div>
          <div className={'text-sm text-neutral-500'}>
            {member.city}, {member.country}
          </div>
        </div>
        <Divider className={'my-3'} />
        <nav className={'flex flex-col p-4 ml-4 text-2xl gap-4'}>
          {navLinks.map((link) => (
            <Link
              href={link.href}
              key={link.name}
              className={`block rounded ${pathname === link.href ? 'text-secondary' : 'hover:text-secondary/50'}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </CardBody>
      <CardFooter>
        <Button as={Link} href={'/members'} fullWidth={true} color={'secondary'} variant={'bordered'}>
          Go back
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MemberSidebar;
