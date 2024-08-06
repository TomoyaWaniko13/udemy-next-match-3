import { CardBody, CardHeader, Divider, Image } from '@nextui-org/react';
import { getAuthUserId } from '@/app/actions/authActions';
import { getMemberPhotosByUserId } from '@/app/actions/memberActions';
import StarButton from '@/components/StarButton';
import DeleteButton from '@/components/DeleteButton';
import ImageUploadButton from '@/components/ImageUploadButton';

// 66 (Displaying the images in the member edit component)
// 67 (Adding the buttons for the image actions)
// 70 (Adding an image upload button)
const PhotosPage = async () => {
  const userId = await getAuthUserId();
  const photos = await getMemberPhotosByUserId(userId);

  return (
    <>
      <CardHeader className={'text-2xl font-semibold text-secondary'}>Edit Profile</CardHeader>
      <Divider />
      <CardBody>
        {/* 70 (Adding an image upload button) */}
        <div className={'pt-5 pl-5'}>
          <ImageUploadButton />
        </div>
        <div className={'grid grid-cols-4 gap-3 p-5'}>
          {photos &&
            photos.map((photo) => (
              // <Image />の上に <StarButton/>と＜DeleteButton/>を配置したいので relativeを使う。
              <div key={photo.id} className={'w-[220px] h-[220px] relative'}>
                <Image width={220} height={220} src={photo.url} alt={'Image of user'} />
                <div className={'absolute top-3 left-3 z-50'}>
                  <StarButton selected={true} loading={false} />
                </div>
                <div className={'absolute top-3 right-3 z-50'}>
                  <DeleteButton loading={false} />
                </div>
              </div>
            ))}
        </div>
      </CardBody>
    </>
  );
};

export default PhotosPage;
