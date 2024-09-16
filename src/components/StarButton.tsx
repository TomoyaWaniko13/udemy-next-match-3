import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { PiSpinnerGap } from 'react-icons/pi';

type Props = {
  selected: boolean;
  loading: boolean;
};

// 67 (Adding the buttons for the image actions)

// selectedがtrueなら黄色い星を表示します。
const StarButton = ({ selected, loading }: Props) => {
  return (
    <div className={'relative hover:opacity-80 transition cursor-pointer'}>
      {loading ? (
        <PiSpinnerGap size={32} className={'fill-white animate-spin'} />
      ) : (
        <>
          <AiOutlineStar size={32} className={'fill-white absolute -top-[2px] -right-[2px]'} />
          <AiFillStar size={28} className={selected ? 'fill-yellow-200' : 'fill-neutral-500/70'} />
        </>
      )}
    </div>
  );
};

export default StarButton;
