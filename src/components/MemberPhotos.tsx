'use client';

import MemberImage from '@/components/MemberImage';
import StarButton from '@/components/StarButton';
import DeleteButton from '@/components/DeleteButton';
import { Photo } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteImage, setMainImage } from '@/app/actions/userActions';
import { toast } from 'react-toastify';

type Props = {
  photos: Photo[] | null;
  // editが目的でない場合、<StarButton/> と <DeleteButton/>を表示しません。
  editing?: boolean;
  mainImageUrl?: string | null;
};

// 73 (Setting the main image)
// 76 (Deleting an image)
// 161. Adding the photo moderation functionality part 1

//  現在のユーザーのアップロードした写真を表示するのに使われます。
// members/edit/photos/page.tsxでは、editingをtrueにするので、現在のユーザーがmainの写真を設定できます。
const MemberPhotos = ({ photos, editing, mainImageUrl }: Props) => {
  const router = useRouter();

  // useState[]の中の{}は, stateがobjectであるということです。。
  const [loading, setLoading] = useState({
    // typeは<StarButton/>か<DeleteButton/>であるかを表します。
    type: '',
    isLoading: false,
    // 複数の写真があるので、id が必要です。
    id: '',
  });

  const onSetMain = async (photo: Photo) => {
    if (photo.url === mainImageUrl) return null;
    // 複数の photo があるので、id が必要です。
    setLoading({ isLoading: true, id: photo.id, type: 'main' });

    // setMainImage() は error を throw する可能性があるので、
    // try & catch を使います。
    try {
      await setMainImage(photo);
      router.refresh();
    } catch (error: any) {
      // setMainImage() のエラー内容を toast で表示します。
      toast.error(error.message);
    } finally {
      setLoading({ isLoading: false, id: '', type: '' });
    }
  };

  const onDelete = async (photo: Photo) => {
    if (photo.url === mainImageUrl) return null;
    // 複数の photo があるので、id が必要です。
    setLoading({ isLoading: true, id: photo.id, type: 'delete' });
    await deleteImage(photo);
    router.refresh();
    setLoading({ isLoading: false, id: '', type: '' });
  };

  return (
    // 横並びで写真を表示します。
    <div className={'grid grid-cols-4 gap-3 p-5'}>
      {photos &&
        photos.map((photo) => (
          // <Image/>の上に <StarButton/>と＜DeleteButton/>を配置したいので relativeを使う。
          <div key={photo.id} className={'w-[220px] h-[220px] relative'}>
            {/* photoがCloudinaryからかfile systemからを判断して写真を表示するcomponent */}
            <MemberImage photo={photo} />
            {editing && (
              <>
                <div className={'absolute top-3 left-3 z-50'} onClick={() => onSetMain(photo)}>
                  <StarButton
                    selected={photo.url == mainImageUrl}
                    loading={loading.isLoading && loading.id === photo.id && loading.type === 'main'}
                  />
                </div>
                <div onClick={() => onDelete(photo)} className={'absolute top-3 right-3 z-50'}>
                  <DeleteButton loading={loading.isLoading && loading.id === photo.id && loading.type === 'delete'} />
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  );
};

export default MemberPhotos;
