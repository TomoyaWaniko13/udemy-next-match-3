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
// TFieldValues は TypeScript のジェネリック型パラメータです。この関数において、フォームのフィールド値の型を表します。
export function handleFormServerErrors<TFieldValues extends FieldValues>(
  errorResponse: { error: string | ZodIssue[] },
  // react-hook-form の setError を使用することで、エラーメッセージを form に表示できます。
  setError: UseFormSetError<TFieldValues>,
) {
  // まず、errorResponse.error が ZodIssue[] 配列かどうか、つまり form の validation が失敗したかどうかをチェックします。
  if (Array.isArray(errorResponse.error)) {
    errorResponse.error.forEach((e: any) => {
      // e.path:
      // これは通常、エラーが発生したフィールドのパスを表す配列です。
      // 例えば、 ['name'] や ['address', 'city'] のようになります。

      // .join('.'):
      // この配列の要素を . で結合して文字列にします。
      // 例えば、 ['address', 'city'] は 'address.city' になります。

      // as Path<TFieldValues>:
      // これは TypeScript の型アサーションです。
      // 結果の文字列を Path<TFieldValues> 型として扱うよう TypeScript に指示しています。

      // Path<TFieldValues>:
      // これは React Hook Form の型で、フォームのフィールドパスを表します。
      // TFieldValues はフォームの値の型です。

      // フォームは、ネストされたオブジェクト構造を持つことがあります。例えば：
      // {
      //   name: string,
      //   address: {
      //     street: string,
      //     city: string
      //   }
      // }
      // サーバーサイドのバリデーションエラーは通常、このネスト構造を配列として表現します。
      // 例: address.city のエラーは ['address', 'city'] として返される可能性があります。
      // React Hook Form は、ネストされたフィールドを表すのにドット記法を使用します。
      // つまり、address.city のようなフォーマットを期待しています。
      // サーバーから返された配列形式のパス（例：['address', 'city']）を、
      // React Hook Form が理解できるドット記法の文字列（例：'address.city'）に変換する必要があります。
      const fieldName = e.path.join('.') as Path<TFieldValues>;
      // setError を使用して、該当するフィールドにエラーメッセージを設定します。
      setError(fieldName, { message: e.message });
    });
  } else {
    // エラーが文字列の場合、'root.serverError' というフィールドにエラーメッセージを設定します。
    // これは通常、フォーム全体に関するエラーを表示するために使用されます。
    setError('root.serverError', { message: errorResponse.error });
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
