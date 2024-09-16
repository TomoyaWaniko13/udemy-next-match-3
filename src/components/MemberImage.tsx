'use client';

import { Photo } from '@prisma/client';
import { CldImage } from 'next-cloudinary';
import { Image } from '@nextui-org/react';
import clsx from 'clsx';

type Props = {
  photo: Photo | null;
};

// 72 (Using the cloudinary image component)
// 161. Adding the photo moderation functionality part 1

const MemberImage = ({ photo }: Props) => {
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
          className={clsx('rounded-2xl', { 'opacity-40': !photo.isApproved })}
        />
      ) : (
        // file systemからの写真の時, <Image/>を使います。
        // <Image/>はNextUIのcomponentです。
        <Image width={220} height={220} src={photo?.url || '/images/user.png'} alt={'Image of user'} />
      )}
      {!photo?.isApproved && (
        <div className={'absolute bottom-2 w-full bg-slate-200 p-1'}>
          <div className={'flex justify-center text-danger font-semibold'}>Awaiting approval</div>
        </div>
      )}
    </div>
  );
};

export default MemberImage;
