import { Member } from '@prisma/client';
import { Card, Image } from '@nextui-org/react';
import { CardFooter } from '@nextui-org/card';
import Link from 'next/link';
import { calculateAge } from '@/lib/util';
import LikeButton from '@/components/LikeButton';

type Props = {
  member: Member;
};

// 43 (Creating cards for the members)
// 44 (Styling the member cards)
const MemberCard = ({ member }: Props) => {
  return (
    <Card fullWidth as={Link} href={`/members/${member.userId}`} isPressable={true}>
      <Image
        isZoomed={true}
        alt={member.name}
        width={300}
        src={member.image || '/images/user.png'}
        className={'aspect-square object-cover'}
      />
      {/* 55 (Creating a like Button) */}
      <div className={'absolute top-3 right-3 z-50'}>
        <LikeButton targetId={member.userId} hasLiked={false} />
      </div>
      <CardFooter className={'flex justify-start bg-black overflow-hidden absolute bottom-0 z-10 bg-dark-gradient'}>
        <div className={'flex flex-col text-white'}>
          <span className={'font-semibold'}>
            {member.name}, {calculateAge(member.dateOfBirth)}
          </span>
          <span className={'text-sm'}>{member.city}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MemberCard;
