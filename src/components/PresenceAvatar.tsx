import usePresenceStore from '@/hooks/usePresenceStore';
import { Badge } from '@nextui-org/badge';
import { Avatar } from '@nextui-org/react';

type Props = {
  userId?: string;
  // this can be a string or  null because not every user has an image.
  // So we'll display a placeholder if they do not have an image.
  src?: string | null;
};

// 107 (Displaying presence in other components)

// /members/[userId]/chat などに表示するアバターです。
// userId に関連づけられている user がオンラインになっているかを判断して、オンラインになっているユーザーを小さい緑色の丸で表現します。
const PresenceAvatar = ({ userId, src }: Props) => {
  // members は presence channelをsubscribeしている(=オンラインである)userのIDを含んでいる配列です。
  // このIDの配列により、誰がオンラインか追跡できます。
  const { members } = usePresenceStore((state) => ({
    members: state.members,
  }));

  // const isOnline = userId && members.indexOf(userId) !== -1;
  const isOnline = userId && members.includes(userId);

  return (
    // isInvisible によって、オンラインであるかを表示できます。
    <Badge content={''} color={'success'} shape={'circle'} isInvisible={!isOnline}>
      {/* NextUIの<Badge/>の中身(今回は<Avatar/>)は自動的に<Badge/>の右上に配置されます。*/}
      <Avatar src={src || '/images/user.png'} alt={'User avatar'} />
    </Badge>
  );
};

export default PresenceAvatar;
