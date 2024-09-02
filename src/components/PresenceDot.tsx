import { Member } from '@prisma/client';
import usePresenceStore from '@/hooks/usePresenceStore';
import { GoDot, GoDotFill } from 'react-icons/go';

type Props = {
  member: Member;
};

// 106 (Creating a presence indicator)
// 受け取った member　がオンラインかどうかを確認して、そうであれば
const PresenceDot = ({ member }: Props) => {
  // membersは現在presence channelにsubscribeしている(=オンラインである)userのIDを含んでいる配列です。
  const { members } = usePresenceStore((state) => ({
    members: state.members,
  }));

  //　オンラインのuserIdの配列に、受け取った memberのuserIdが含まれているか確認します。
  //　つまり、受け取った member　がオンラインかどうかを確認します。
  const isOnline = members.indexOf(member.userId) !== -1;

  if (!isOnline) return null;

  return (
    <>
      <GoDot size={36} className={'fill-white absolute -top-[2px] -right-[2px]'} />
      <GoDotFill size={32} className={'fill-green-500 animate-pulse'} />
    </>
  );
};

export default PresenceDot;
