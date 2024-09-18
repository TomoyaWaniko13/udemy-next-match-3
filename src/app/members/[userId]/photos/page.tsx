import { CardBody, CardHeader, Divider } from '@nextui-org/react';
import { getMemberPhotosByUserId } from '@/app/actions/memberActions';
import MemberPhotos from '@/components/MemberPhotos';

// 48 (Creating the member detailed content)
// 169. Adding an image modal

const PhotosPage = async ({ params }: { params: { userId: string } }) => {
  const photos = await getMemberPhotosByUserId(params.userId);

  return (
    <>
      <CardHeader className={'text-2xl font-semibold text-secondary'}>Photos</CardHeader>
      <Divider />
      <CardBody>
        <MemberPhotos photos={photos} />
      </CardBody>
    </>
  );
};

export default PhotosPage;
