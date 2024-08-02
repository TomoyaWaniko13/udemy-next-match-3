import { Member } from '@prisma/client';
import { Card, Image } from '@nextui-org/react';
import { CardFooter } from '@nextui-org/card';

type Props = {
  member: Member;
};

// 43 (Creating cards for the members)
const MemberCard = ({ member }: Props) => {
  return (
    <Card fullWidth>
      <Image
        isZoomed={true}
        alt={member.name}
        width={300}
        src={member.image || '/images/user.png'}
        className={'aspect-square object-cover'}
      />
      <CardFooter>
        <div className={'flex flex-col text-white'}>
          <span className={'font-semibold'}>{member.name}</span>
          <span className={'text-sm'}>{member.city}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MemberCard;
