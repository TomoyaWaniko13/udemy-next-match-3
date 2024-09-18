'use client';

import { useRouter } from 'next/navigation';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { PiSpinnerGap } from 'react-icons/pi';

// 55 (Creating a like button)
// 174. Adding a spinner to the likes and deploying again

type Props = {
  loading: boolean;
  hasLiked: boolean;
  toggleLike: () => void;
};

const LikeButton = ({ loading, toggleLike, hasLiked }: Props) => {
  const router = useRouter();

  // async function toggleLike() {
  //   // toggleLikeMember()はhasLikeがtrueならいいねを取り消す、falseならいいねをつけるsever action
  //   await toggleLikeMember(targetId, hasLiked);
  //   router.refresh();
  // }

  return (
    <>
      {!loading ? (
        <div onClick={toggleLike} className={'relative hover:opacity-80 transition cursor-pointer'}>
          <AiOutlineHeart size={28} className={'fill-white absolute -top-[2px] -right-[2px]'} />
          <AiFillHeart size={24} className={hasLiked ? 'fill-rose-500' : 'fill-neutral-500/70'} />
        </div>
      ) : (
        <PiSpinnerGap size={32} className={'fill-white animate-spin'} />
      )}
    </>
  );
};

export default LikeButton;
