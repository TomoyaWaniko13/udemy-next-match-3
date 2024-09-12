'use client';

import { Member } from '@prisma/client';
import { Card, Image } from '@nextui-org/react';
import { CardFooter } from '@nextui-org/card';
import Link from 'next/link';
import { calculateAge } from '@/lib/util';
import LikeButton from '@/components/LikeButton';
import PresenceDot from '@/components/PresenceDot';

type Props = {
  member: Member;
  likeIds: string[];
};

// 43 (Creating cards for the members)
// 44 (Styling the member cards)
// 55 (Creating a like Button)
// 56 (Fetching the likes)
// 106 (Creating a presence indicator)
// /members page に表示するユーザーの写真を含んだカードです。
const MemberCard = ({ member, likeIds }: Props) => {
  // 56 (Fetching the likes)
  // member.userId が likeIds array に含まれている状態が、その member にいいねをしている状態です。
  // member.userIdがlikeIds arrayに含まれていない状態が、そのmemberにいいねをしていない状態です。
  const hasLiked = likeIds.includes(member.userId);

  // 56 (Fetching the likes)
  const preventLikeAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

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
      <div onClick={preventLikeAction}>
        <div className={'absolute top-3 right-3 z-50'}>
          <LikeButton targetId={member.userId} hasLiked={hasLiked} />
        </div>
        <div className={'absolute top-2 left-3 z-50'}>
          <PresenceDot member={member} />
        </div>
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
