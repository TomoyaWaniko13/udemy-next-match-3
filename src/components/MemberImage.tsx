'use client';

import { Photo } from '@prisma/client';
import { CldImage } from 'next-cloudinary';
import { Image } from '@nextui-org/react';

type Props = {
  photo: Photo | null;
};

// 72 (Using the cloudinary image component)

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
          className={'rounded-2xl'}
        />
      ) : (
        // file systemからの写真の時, <Image/>を使います。
        // <Image/>はNextUIのcomponentです。
        <Image width={220} height={220} src={photo?.url || '/images/user.png'} alt={'Image of user'} />
      )}
    </div>
  );
};

export default MemberImage;
