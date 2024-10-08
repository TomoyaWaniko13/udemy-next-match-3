import { TokenType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

// 143. Creating the token functions
// 指定されたメールアドレスに関連付けられたトークンをデータベースから取得します。
// ユーザーが既存のトークンを持っているかどうかを確認するのに使用されます。
export async function getTokenByEmail(email: string) {
  try {
    return prisma.token.findFirst({ where: { email } });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 145. Adding the verify email function
// 引数の token は、ランダムな文字列で Token model の property の1つです。
export async function getTokenByToken(token: string) {
  try {
    return prisma.token.findFirst({ where: { token } });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 143. Creating the token functions
export async function generateToken(associatedEmail: string, type: TokenType) {
  //
  // ランダムな48バイトの16進数文字列として token: string を生成します。
  const token: string = randomBytes(48).toString('hex');

  // トークンの有効期限を24時間に設定します。
  // 1秒 (*60)-> 1分 (*60)-> 1時間 (*24)-> 24時間
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  // 同じメールアドレスに対する既存のトークンがある場合、それを削除します。
  // 古いトークンを削除することで、アクティブなトークンが1つだけになることを保証します。
  const fetchedTokenByEmail = await getTokenByEmail(associatedEmail);
  if (fetchedTokenByEmail) await prisma.token.delete({ where: { id: fetchedTokenByEmail.id } });

  // 新しいトークンをデータベースに保存します。
  return prisma.token.create({ data: { email: associatedEmail, token, expires, type } });
}
