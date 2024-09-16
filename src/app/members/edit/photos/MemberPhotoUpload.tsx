'use client';

import ImageUploadButton from '@/components/ImageUploadButton';
import { useRouter } from 'next/navigation';
import { CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { addImage } from '@/app/actions/userActions';
import { toast } from 'react-toastify';

// 71 (Adding the image upload server actions)

// Cloudinaryに画像をアップロードしてから、データベースにMemberのプロパティのsecure_urlとpublic_idを保存します。
const MemberPhotoUpload = () => {
  const router = useRouter();

  // CloudinaryUploadWidgetResults は
  // Cloudinary のアップロードウィジェットが成功時に返す結果の型です.
  const onAddImage = async (result: CloudinaryUploadWidgetResults) => {
    // result.info objectは secure_url や public_idなどのプロパティを持っています。
    // また,result.info は undefined になりうるので、 typeof で object であるか確認します。
    if (result.info && typeof result.info === 'object') {
      // secure_url はその画像にアクセスできるURLです。
      // public_id は ユニークなstring と Cloudinary上で保存されるフォルダ一の名前を組み合わせたものです。
      await addImage(result.info.secure_url, result.info.public_id);
      router.refresh();
    } else {
      toast.error('Problem adding image');
    }
  };

  // onAddImage() を <ImageUploadButton/> に渡して、そのボタンによって
  // Cloudinary に画像がアップロードされてから、 onAddImage() を実行します。
  return <ImageUploadButton onUploadImage={onAddImage} />;
};

export default MemberPhotoUpload;
