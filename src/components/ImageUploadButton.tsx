'use client';

import { CldUploadButton } from 'next-cloudinary';
import { HiPhoto } from 'react-icons/hi2';

// 70 (Adding an image upload button)
// https://next.cloudinary.dev/clduploadbutton/basic-usage
const ImageUploadButton = () => {
  return (
    <CldUploadButton
      options={{ maxFiles: 1 }}
      onSuccess={(res) => console.log(res)}
      signatureEndpoint={'/api/sign-image'}
      uploadPreset={'nm-demo'}
      className={'flex items-center gap-2 bg-secondary text-white rounded-lg py-2 px-4 hover:bg-secondary/70'}
    >
      <HiPhoto size={28} />
      Upload new image
    </CldUploadButton>
  );
};

export default ImageUploadButton;
