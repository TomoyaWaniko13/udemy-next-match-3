import cloudinary from 'cloudinary';

// 69 (Setting up Cloudinary)
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// So when we do use Cloudinary we're just going to use this one we're exporting here rather than using the one from the package.
// Otherwise, then we're going to need to specify our keys again when we do use it.
export { cloudinary };
