import { cloudinary } from '@/lib/cloudinary';

// 70 (Adding an image upload button)
// https://cloudinary.com/blog/cloudinary-image-uploads-using-nextjs-app-router
// documentに従って書くだけ。
export async function POST(request: Request) {
  const body = (await request.json()) as { paramsToSign: Record<string, string> };
  const { paramsToSign } = body;

  const signature = cloudinary.v2.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

  return Response.json({ signature });
}
