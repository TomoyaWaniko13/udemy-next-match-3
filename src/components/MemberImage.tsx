'use client';

import { Photo } from '@prisma/client';
import { CldImage } from 'next-cloudinary';
import { Button, Image, useDisclosure } from '@nextui-org/react';
import clsx from 'clsx';
import { useRole } from '@/hooks/useRole';
import { ImCheckmark, ImCross } from 'react-icons/im';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { approvePhoto, rejectPhoto } from '@/app/actions/adminActions';
import AppModal from '@/components/AppModal';

// 72 (Using the cloudinary image component)
// 161. Adding the photo moderation functionality part 1
// 162. Adding the photo moderation functionality part 2
// 164. Adding the photo moderation functionality part 4
// 169. Adding an image modal

type Props = {
  photo: Photo | null;
};

const MemberImage = ({ photo }: Props) => {
  // 現在のユーザーの role を取得します。
  const role = useRole();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!photo) return null;

  // approvePhoto() において、photoId: string を使って、
  // Photo model から 関連する Member model を取得するので、
  // photo: Photo ではなく photoId: string が引数として必要です。
  const approve = async (photoId: string) => {
    try {
      await approvePhoto(photoId);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const reject = async (photo: Photo) => {
    try {
      await rejectPhoto(photo);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className={'cursor-pointer'} onClick={onOpen}>
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
      {/* role が ADMIN であれば、写真を承認するかしないかを決定できます。 */}
      {role === 'ADMIN' && (
        <div className={'flex flex-row gap-2 mt-2'}>
          <Button onClick={() => approve(photo.id)} color={'success'} variant={'bordered'} fullWidth={true}>
            <ImCheckmark size={20} />
          </Button>
          <Button onClick={() => reject(photo)} color={'danger'} variant={'bordered'} fullWidth={true}>
            <ImCross size={20} />
          </Button>
        </div>
      )}
      <AppModal
        imageModal={true}
        isOpen={isOpen}
        onClose={onClose}
        body={
          <div className={'w-full'}>
            {photo?.publicId ? (
              // Cloudinaryからの写真の時, <CldImage/>を使う。
              // <CldImage/> について:
              // https://next.cloudinary.dev/cldimage/basic-usage
              <CldImage
                alt={'Image of member'}
                src={photo.publicId}
                width={750}
                height={750}
                crop={'fill'}
                gravity={'faces'}
                className={clsx('rounded-2xl', { 'opacity-40': !photo.isApproved && role !== 'ADMIN' })}
              />
            ) : (
              // file systemからの写真の時, <Image/>を使います。
              // <Image/>はNextUIのcomponentです。
              <Image width={750} height={750} src={photo?.url || '/images/user.png'} alt={'Image of user'} />
            )}
          </div>
        }
      />
    </div>
  );
};

export default MemberImage;
