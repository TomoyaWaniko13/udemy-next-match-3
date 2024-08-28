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
const PresenceAvatar = ({ userId, src }: Props) => {
  const { members } = usePresenceStore((state) => ({
    members: state.members,
  }));

  const isOnline = userId && members.indexOf(userId) !== -1;

  return (
    <Badge content={''} color={'success'} shape={'circle'} isInvisible={!isOnline}>
      <Avatar src={src || '/images/user.png'} alt={'User avatar'} />
    </Badge>
  );
};

export default PresenceAvatar;
