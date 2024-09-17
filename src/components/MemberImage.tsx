'use client';

import { Photo } from '@prisma/client';
import { CldImage } from 'next-cloudinary';
import { Button, Image } from '@nextui-org/react';
import clsx from 'clsx';
import { useRole } from '@/hooks/useRole';
import { ImCheckmark, ImCross } from 'react-icons/im';

type Props = {
  photo: Photo | null;
};

// 72 (Using the cloudinary image component)
// 161. Adding the photo moderation functionality part 1
// 162. Adding the photo moderation functionality part 2

const MemberImage = ({ photo }: Props) => {
  const role = useRole();

  return (
    <div>
      {photo?.publicId ? (
        // Cloudinaryからの写真の時, <CldImage/>を使う。
        // <CldImage/> について:
        // https://next.cloudinary.dev/cldimage/basic-usage
        <CldImage
          alt={'Image of member'}
          src={photo.publicId}
          width={300}
          height={300}
          crop={'fill'}
          gravity={'faces'}
          className={clsx('rounded-2xl', { 'opacity-40': !photo.isApproved && role !== 'ADMIN' })}
        />
      ) : (
        // file systemからの写真の時, <Image/>を使います。
        // <Image/>はNextUIのcomponentです。
        <Image width={220} height={220} src={photo?.url || '/images/user.png'} alt={'Image of user'} />
      )}
      {!photo?.isApproved && role !== 'ADMIN' && (
        <div className={'absolute bottom-2 w-full bg-slate-200 p-1'}>
          <div className={'flex justify-center text-danger font-semibold'}>Awaiting approval</div>
        </div>
      )}
      {role === 'ADMIN' && (
        <div className={'flex flex-row gap-2 mt-2'}>
          <Button color={'success'} variant={'bordered'} fullWidth={true}>
            <ImCheckmark size={20} />
          </Button>
          <Button color={'danger'} variant={'bordered'} fullWidth={true}>
            <ImCross size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MemberImage;
