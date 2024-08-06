'use client';

import { CldUploadButton, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { HiPhoto } from 'react-icons/hi2';

type Props = {
  // onUploadImageはpropertyの名前です。
  // (result: CloudinaryUploadWidgetResult): この関数は1つの引数 result を受け取り、その型は CloudinaryUploadWidgetResult です。
  // CloudinaryUploadWidgetResult is the type of thing that we get back from the onSuccess callback.
  // => void: この関数は何も返さない（void を返す）ことを示しています。
  // この関数は、画像のアップロードが成功したときに呼び出され、アップロードの結果を処理するために使用されます。
  onUploadImage: (result: CloudinaryUploadWidgetResults) => void;
};

// 70 (Adding an image upload button)
// 71 (Adding the image upload server actions)
// https://next.cloudinary.dev/clduploadbutton/basic-usage

const ImageUploadButton = ({ onUploadImage }: Props) => {
  return (
    <CldUploadButton
      options={{ maxFiles: 1 }}
      onSuccess={onUploadImage}
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
