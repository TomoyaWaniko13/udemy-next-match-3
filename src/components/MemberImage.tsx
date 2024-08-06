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
        // Cloudinaryの写真の時, CldImageを使う。
        // CldImageはnext-cloudinaryのcomponent.
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
        // file systemの写真の時, <Image />を使う。
        // <Image />はNextUIのcomponent.
        <Image width={220} height={220} src={photo?.url || '/images/user.png'} alt={'Image of user'} />
      )}
    </div>
  );
};

export default MemberImage;
