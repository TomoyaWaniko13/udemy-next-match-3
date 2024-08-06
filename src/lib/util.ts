import { differenceInYears } from 'date-fns';
import { FieldValues, UseFormSetError, Path } from 'react-hook-form';
import { ZodIssue } from 'zod';

// 44 (Styling the members cards)
export function calculateAge(dateOfBirth: Date) {
  return differenceInYears(new Date(), dateOfBirth);
}

// 65 (Adding the server action to update the member)
// この関数の主な目的は、サーバーサイドのバリデーションエラー（server actionで検知したバリデーションエラー）をクライアントサイドの
// フォームエラーに変換することです。これにより、ユーザーに適切なフィードバックを提供し、どのフィールドに問題があるかを
// 示すことができます。

// TFieldValues はTypeScriptのジェネリック型パラメータです。この関数において、フォームのフィールド値の型を表します。
// T はTypeScriptの慣習で、型パラメータを示すために使用されます。
export function handleFormServerErrors<TFieldValues extends FieldValues>(
  // サーバーからのエラーレスポンス。
  errorResponse: { error: string | ZodIssue[] },
  setError: UseFormSetError<TFieldValues>,
) {
  // まず、errorResponse.error が配列かどうか(formのvalidationが失敗したかどうか)をチェックします。
  // なぜ配列になるかは registerUser() from authActions.tsと updateMemberProfile() from userActions.tsをチェック
  if (Array.isArray(errorResponse.error)) {
    errorResponse.error.forEach((e: any) => {
      // e.path: これは通常、エラーが発生したフィールドのパスを表す配列です。例えば、 ['name'] や ['address', 'city'] のようになります。
      // .join('.'): この配列の要素を . で結合して文字列にします。例えば、 ['address', 'city'] は 'address.city' になります。
      // as Path<TFieldValues>: これは TypeScript の型アサーションです。結果の文字列を Path<TFieldValues> 型として扱うよう TypeScript に指示しています。
      // Path<TFieldValues>: これは React Hook Form の型で、フォームのフィールドパスを表します。TFieldValues はフォームの値の型です。
      const fieldName = e.path.join('.') as Path<TFieldValues>;
      // setError を使用して、該当するフィールドにエラーメッセージを設定します。
      setError(fieldName, { message: e.message });
    });
  } else {
    // エラーが文字列の場合 (一般的なサーバーエラー):
    // 'root.serverError' というフィールドにエラーメッセージを設定します。これは通常、フォーム全体に関するエラーを表示するために使用されます。
    setError('root.serverError', { message: errorResponse.error });
  }
}
