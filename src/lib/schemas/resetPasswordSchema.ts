import { z } from 'zod';

// 148. Adding the forgot password functionality part 3
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters',
    }),
    confirmPassword: z.string().min(6),
  })
  // refine() は、カスタムのバリデーションロジックを追加するために使用されます
  .refine(
    // passwordとconfirmPasswordが等しいかどうかをチェックします。
    (data) => data.password === data.confirmPassword,
    //　第二引数のオブジェクトには、バリデーションが失敗した場合のオプションが含まれています
    {
      //　バリデーションが失敗した場合に表示されるエラーメッセージです。
      message: 'password do not match',
      // エラーを関連付けるフィールドを指定します。この場合、confirmPasswordフィールドにエラーが関連付けられます。
      path: ['confirmPassword'],
    },
  );

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
