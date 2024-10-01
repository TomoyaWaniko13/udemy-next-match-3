import { differenceInYears, format, formatDistance } from 'date-fns';
import { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ZodIssue } from 'zod';

// 44 (Styling the members cards)
// 138. Adding a Register wizard part 1
export function calculateAge(dateOfBirth: Date) {
  return differenceInYears(new Date(), dateOfBirth);
}

// 84 (Creating a message DTO)
export function formatShortDateTime(date: Date) {
  // 18 Aug 24 3:30:PM というふうにフォーマットされます。
  return format(date, 'dd MMM yy h:mm:a');
}

// 101 (Adding the read message feature)
export function timeAgo(date: string) {
  return formatDistance(new Date(date), new Date()) + ' ago';
}

// 65 (Adding the server action to update the member)
export function handleFormServerErrors<TFieldValues extends FieldValues>(
  errorResponse: { error: ZodIssue[] | string },
  setError: UseFormSetError<TFieldValues>,
) {
  //
  if (Array.isArray(errorResponse.error)) {
    errorResponse.error.forEach((e: any) => {
      const errorFieldName = e.path.join('.') as Path<TFieldValues>;
      setError(errorFieldName, { message: e.message });
    });
    //
  } else {
    setError('root.serverError', { message: errorResponse.error as string });
  }
}

// 77 (Tidying up the images)
export function transformImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return null;

  if (!imageUrl.includes('cloudinary')) return imageUrl;

  // indexOf() メソッドは、指定された部分文字列（この場合 '/upload/'）が最初に出現する位置のインデックスを返します。
  // + '/upload/'.length で '/upload/' の長さ（7文字）を加算しています。
  // これにより、実際の uploadIndex は '/upload/' の直後の文字を指すことになります。
  const uploadIndex = imageUrl.indexOf('/upload/') + '/upload/'.length;

  const transformation = 'c_fill,w_300,h_300,g_faces/';

  // 最初の slice(0, uploadIndex) は、URL の先頭（インデックス0）から uploadIndex の位置まで（uploadIndex は含まない）の部分を切り出します。
  // 2つ目の imageUrl.slice(uploadIndex) は、uploadIndex の位置から('/upload/' の直後から) URL の末尾までの部分を切り出します。
  return `${imageUrl.slice(0, uploadIndex)}${transformation}${imageUrl.slice(uploadIndex)}`;
}

// 94 (Finishing up the message table)
export function truncateString(text?: string | null, num = 50) {
  if (!text) return null;

  if (text.length <= num) {
    return text;
  }

  return text.slice(0, num) + '...';
}

// 98 (Adding the live chat functionality)
export function createChatId(a: string, b: string) {
  return a > b ? `${b}-${a}` : `${a}-${b}`;
}
