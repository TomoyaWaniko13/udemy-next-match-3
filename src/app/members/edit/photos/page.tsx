import { CardBody, CardHeader, Divider } from '@nextui-org/react';
import { getAuthUserId } from '@/app/actions/authActions';
import { getMemberByUserId, getMemberPhotosByUserId } from '@/app/actions/memberActions';
import MemberPhotoUpload from '@/app/members/edit/photos/MemberPhotoUpload';
import MemberPhotos from '@/components/MemberPhotos';

// 66 (Displaying the images in the member edit component)
// 67 (Adding the buttons for the image actions)
// 70 (Adding an image upload button)
// 71 (Adding the image upload server actions)
// 72 (Using the Cloudinary image component)
// 73 (Setting the main image)
const PhotosPage = async () => {
  const userId = await getAuthUserId();
  const member = await getMemberByUserId(userId);
  const photos = await getMemberPhotosByUserId(userId);

  return (
    <>
      <CardHeader className={'text-2xl font-semibold text-secondary'}>Edit Profile</CardHeader>
      <Divider />
      <CardBody>
        {/* 71 (Adding the image upload server actions) */}
        <MemberPhotoUpload />
        {/* 73 (Setting the main image) */}
        <MemberPhotos photos={photos} editing={true} mainImageUrl={member?.image} />
      </CardBody>
    </>
  );
};

export default PhotosPage;
