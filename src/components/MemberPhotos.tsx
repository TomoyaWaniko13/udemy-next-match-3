'use client';

import MemberImage from '@/components/MemberImage';
import StarButton from '@/components/StarButton';
import DeleteButton from '@/components/DeleteButton';
import { Photo } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerSchema } from '@/lib/schemas/registerSchema';
import { setMainImage } from '@/app/actions/userActions';

type Props = {
  photos: Photo[] | null;
  // userのprofile pageの場合(editが目的でない場合)、<StarButton />と<DeleteButton />を表示しない。
  // なので、editすることが目的(editingがtrue)か、それとも　写真を表示することだけが目的(editingがfalse)かを表す真偽値が必要。
  editing?: boolean;
  // Member modelのimageの値がそのMemberのmainのimageのURL(=mainImageUrl)です。
  mainImageUrl?: string | null;
};

// 73 (Setting the main image)
//  ログインしているユーザーが自分がアップロードした写真を表示するのに使われる。
// members/edit/photos/page.tsxでは、editingをtrueにするので、ログインしているユーザーがmainの写真を設定できるようになる。
const MemberPhotos = ({ photos, editing, mainImageUrl }: Props) => {
  const router = useRouter();

  // useState[]の中の{}はobjectであるということ。
  const [loading, setLoading] = useState({
    // typeは<StarButton />か<DeleteButton />であるかを表す。
    type: '',
    isLoading: false,
    id: '',
  });

  const onSetMain = async (photo: Photo) => {
    // photoがすでにmainとして設定されていれば、onSetMain()を終了する。
    if (photo.url === mainImageUrl) return null;
    setLoading({ isLoading: true, id: photo.id, type: 'main' });
    //setMainImage()は 画像の<StarButton />を押した時に、その画像をMainにするserver action.
    await setMainImage(photo);
    router.refresh();
    setLoading({ isLoading: false, id: '', type: '' });
  };

  return (
    <div className={'grid grid-cols-4 gap-3 p-5'}>
      {photos &&
        photos.map((photo) => (
          // <Image />の上に <StarButton/>と＜DeleteButton/>を配置したいので relativeを使う。
          <div key={photo.id} className={'w-[220px] h-[220px] relative'}>
            {/* 72 (Using the Cloudinary image component) */}
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
                <div className={'absolute top-3 right-3 z-50'}>
                  <DeleteButton loading={false} />
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  );
};

export default MemberPhotos;
