import Link from 'next/link';
import { Image } from '@nextui-org/react';
import { transformImageUrl } from '@/lib/util';
import { MessageDto } from '@/types';
import { toast } from 'react-toastify';

type Props = {
  image?: string | null;
  href: string;
  title: string;
  subtitle?: string;
};

// 116 (Challenge solution)
export default function NotificationToast({ image, href, title, subtitle }: Props) {
  return (
    <Link href={href} className={'flex items-center'}>
      {/* この div は左側に配置します。 つまり image を左側に配置します。*/}
      <div className={'mr-2'}>
        <Image src={transformImageUrl(image) || '/images/user.png'} height={50} width={50} alt={'sender image'} />
      </div>
      {/* この div は右側に配置します。 */}
      <div className={'flex flex-grow flex-col justify-center'}>
        {/* titleは上に表示します。 */}
        <div className={'font-semibold'}>{title}</div>
        {/* この div は下に表示します。　*/}
        <div className={'text-sm'}>{subtitle || 'Click to view'}</div>
      </div>
    </Link>
  );
}

export const newMessageToast = (message: MessageDto) => {
  toast(
    <NotificationToast
      image={message.senderImage}
      href={`/members/${message.senderId}/chat`}
      title={`${message.senderName} has sent you a new message`}
    />,
  );
};

// name, image, userIdは serverから取得します。
export const newLikeToast = (name: string, image: string | null, userId: string) => {
  toast(
    <NotificationToast
      image={image}
      href={`/members/${userId}`}
      title={`You have been liked by ${name}`}
      subtitle={'Click here to view their profile'}
    />,
  );
};
