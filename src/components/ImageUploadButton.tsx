'use client';

import { CldUploadButton, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { HiPhoto } from 'react-icons/hi2';

type Props = {
  onUploadImage: (result: CloudinaryUploadWidgetResults) => void;
};

// 70 (Adding an image upload button)
// 71 (Adding the image upload server actions)

const ImageUploadButton = ({ onUploadImage }: Props) => {
  // <CldUploadButton/> の使い方:
  // https://next.cloudinary.dev/clduploadbutton/basic-usage
  // https://next.cloudinary.dev/clduploadwidget/configuration
  return (
    <CldUploadButton
      className={'flex items-center gap-2 bg-secondary text-white rounded-lg py-2 px-4 hover:bg-secondary/70'}
      options={{ maxFiles: 1 }}
      onSuccess={onUploadImage}
      signatureEndpoint={'/api/sign-image'}
      uploadPreset={'nm-demo'}
    >
      <HiPhoto size={28} />
      Upload new image
    </CldUploadButton>
  );
};

export default ImageUploadButton;
