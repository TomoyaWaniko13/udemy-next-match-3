'use client';

import ImageUploadButton from '@/components/ImageUploadButton';
import { useRouter } from 'next/navigation';
import { CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { addImage } from '@/app/actions/userActions';
import { toast } from 'react-toastify';

// 71 (Adding the image upload server actions)
// Cloudinaryに画像をアップロードしてから、databaseのMemberにsecure_urlとpublic_idを保存する。
const MemberPhotoUpload = () => {
  const router = useRouter();

  // CloudinaryUploadWidgetResults は Cloudinary のアップロードウィジェットが成功時に返す結果の型です.
  const onAddImage = async (result: CloudinaryUploadWidgetResults) => {
    // And inside here we're going to check to see if we have the result.info first of all,
    // as this contains the information like the secure_url and the public_id.
    // But we need to be a bit more specific with this because e result.info,
    // This could either be a type of CloudinaryUploadWidgetInfo or it could be undefined.
    // So in order to get access to the properties such as the secure_url which do not seem to
    // be available just from the info object, we need to be a bit more type specific here,
    // so as well as check in to make sure we've got the results.info.
    if (result.info && typeof result.info === 'object') {
      // addImage()はMember modelにおいてPhotoのurlとpublicIdを記録するserver action
      await addImage(result.info.secure_url, result.info.public_id);
      router.refresh();
    } else {
      toast.error('Problem adding image');
    }
  };

  return (
    <div>
      <ImageUploadButton onUploadImage={onAddImage} />
    </div>
  );
};

export default MemberPhotoUpload;
