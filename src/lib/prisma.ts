import { PrismaClient } from '@prisma/client';

// Node.js のグローバルオブジェクトに prisma プロパティを追加するための型定義を行っています。
const globalForPrisma = global as unknown as { prisma: PrismaClient };

//　既存のグローバル Prisma インスタンスがあればそれを使用し、なければ新しい PrismaClient インスタンスを作成します。
// ログオプションで全てのクエリをログ出力するように設定しています。
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ log: ['query'] });

// 本番環境以外（開発環境など）では、作成した Prisma クライアントインスタンスをグローバルオブジェクトに保存します。
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
