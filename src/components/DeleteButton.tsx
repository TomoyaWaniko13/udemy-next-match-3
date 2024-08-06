import { AiFillDelete, AiFillStar, AiOutlineDelete } from 'react-icons/ai';
import { PiSpinnerGap } from 'react-icons/pi';

type Props = {
  loading: boolean;
};

// 67 (Adding the buttons for the image actions)
const DeleteButton = ({ loading }: Props) => {
  return (
    <div className={'relative hover:opacity-80 transition cursor-pointer'}>
      {loading ? (
        <PiSpinnerGap size={32} className={'fill-white animate-spin'} />
      ) : (
        <>
          <AiOutlineDelete size={32} className={'fill-white absolute -top-[2px] -right-[2px]'} />
          <AiFillDelete size={28} className={'fill-red-600'} />
        </>
      )}
    </div>
  );
};

export default DeleteButton;
