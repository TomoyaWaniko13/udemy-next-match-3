import { Member } from '@prisma/client';
import usePresenceStore from '@/hooks/usePresenceStore';
import { GoDot, GoDotFill } from 'react-icons/go';

type Props = {
  member: Member;
};

// 106 (Creating a presence indicator)
// 受け取った member がオンラインかどうかを確認して、そうであれば
// 小さいDotでオンラインであると表現します。
// この <PresenceDot/> を配置すれば、どこでもそのユーザーのがオンラインであるか表示できます。
const PresenceDot = ({ member }: Props) => {
  // members 変数は現在 presence channel を subscribeしている、
  // つまりオンラインである user の ID 配列です。
  // state は store のすべての状態を含んでいます。
  const { members } = usePresenceStore((state) => ({
    members: state.members,
  }));

  // const isOnline = members.indexOf(member.userId) !== -1;
  const isOnline = members.includes(member.userId);

  if (!isOnline) return null;

  return (
    <>
      <GoDot size={36} className={'fill-white absolute -top-[2px] -right-[2px]'} />
      <GoDotFill size={32} className={'fill-green-500 animate-pulse'} />
    </>
  );
};

export default PresenceDot;
