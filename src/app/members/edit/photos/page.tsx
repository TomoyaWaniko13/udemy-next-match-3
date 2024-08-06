import { CardBody, CardHeader, Divider, Image } from '@nextui-org/react';
import { getAuthUserId } from '@/app/actions/authActions';
import { getMemberPhotosByUserId } from '@/app/actions/memberActions';

// 66 (Displaying the images in the member edit component)
const PhotosPage = async () => {
  const userId = await getAuthUserId();
  const photos = await getMemberPhotosByUserId(userId);

  return (
    <>
      <CardHeader className={'text-2xl font-semibold text-secondary'}>Edit Profile</CardHeader>
      <Divider />
      <CardBody>
        <div className={'grid grid-cols-4 gap-3 p-5'}>
          {photos &&
            photos.map((photo) => (
              // <Image />の上に <Button />を配置したいので relativeを使う。
              <div key={photo.id} className={'w-[220px] h-[220px] relative'}>
                <Image width={220} height={220} src={photo.url} alt={'Image of user'} />
              </div>
            ))}
        </div>
      </CardBody>
    </>
  );
};

export default PhotosPage;
