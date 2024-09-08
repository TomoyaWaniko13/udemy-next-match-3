import { TokenType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

// 143. Creating the token functions
// 指定されたメールアドレスに関連付けられたトークンをデータベースから取得します。
// ユーザーが既存のトークンを持っているかどうかを確認するのに使用されます。
export async function getTokenByEmail(email: string) {
  try {
    return prisma.token.findFirst({
      where: { email },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 143. Creating the token functions
// 新しいトークンを生成し、データベースに保存します。
export async function generateToken(email: string, type: TokenType) {
  // ランダムな48バイトの16進数文字列としてトークンを生成します。
  const token = randomBytes(48).toString('hex');
  // トークンの有効期限を24時間に設定します。
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  // 同じメールアドレスに対する既存のトークンがある場合、それを削除します。
  // 古いトークンを削除することで、アクティブなトークンが1つだけになることを保証します。
  const existingToken = await getTokenByEmail(email);

  if (existingToken) {
    await prisma.token.delete({
      where: { id: existingToken.id },
    });
  }

  // 新しいトークンをデータベースに保存します。
  return prisma.token.create({
    data: {
      email,
      token,
      expires,
      type,
    },
  });
}
