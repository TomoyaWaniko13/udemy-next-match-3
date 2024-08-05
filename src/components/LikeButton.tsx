'use client';

import { useRouter } from 'next/navigation';
import { toggleLikeMember } from '@/app/actions/likeActions';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

type Props = {
  targetId: string;
  hasLiked: boolean;
};

// 55 (Creating a like button)
const LikeButton = ({ targetId, hasLiked }: Props) => {
  const router = useRouter();

  async function toggleLike() {
    // toggleLikeMember()はhasLikeがtrueならいいねを取り消す、falseならいいねをつけるsever action
    await toggleLikeMember(targetId, hasLiked);
    router.refresh();
  }

  return (
    <div onClick={toggleLike} className={'relative hover:opacity-80 transition cursor-pointer'}>
      <AiOutlineHeart size={28} className={'fill-white absolute -top-[2px] -right-[2px]'} />
      <AiFillHeart size={24} className={hasLiked ? 'fill-rose-500' : 'fill-neutral-500/70'} />
    </div>
  );
};

export default LikeButton;
