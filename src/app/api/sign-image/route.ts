import { cloudinary } from '@/lib/cloudinary';

// 70 (Adding an image upload button)

// documentに従って書きます。
// https://cloudinary.com/blog/cloudinary-image-uploads-using-nextjs-app-router
export async function POST(request: Request) {
  const body = (await request.json()) as { paramsToSign: Record<string, string> };
  const { paramsToSign } = body;

  const signature = cloudinary.v2.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

  return Response.json({ signature });
}
