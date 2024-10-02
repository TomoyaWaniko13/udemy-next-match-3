import { ZodIssue } from 'zod';
import { Prisma } from '@prisma/client';

// | (Union Type) は、複数の型のうちの1つを取りうることを示します。
type ActionResult<T> = { status: 'success'; data: T } | { status: 'error'; error: string | ZodIssue[] };

// 84 (Creating a message DTO)
// MessageWithSenderRecipient 型は、Prismaの型生成機能を利用して作成された型です。
// messageActions.ts において、Messageモデルに対して特定の選択（select）を行った結果の型を生成します。
type MessageWithSenderRecipient = Prisma.MessageGetPayload<{
  select: {
    id: true;
    text: true;
    created: true;
    dateRead: true;
    sender: { select: { userId; name; image } };
    recipient: { select: { userId; name; image } };
  };
}>;

// 84 (Creating a message DTO)
type MessageDto = {
  id: string;
  text: string;
  created: string;
  dateRead: string | null;
  // schema.prisma file で sender と recipient を optional にしたので、
  // 以下の properties も optional にする必要がある。
  senderId?: string;
  senderName?: string;
  senderImage?: string | null;
  recipientId?: string;
  recipientName?: string;
  recipientImage?: string | null;
};

// 121 (Adding the age slider functionality)
// 135 (Challenge solution)

// Filters.tsx で設定できる条件を表しています。
// これにより memberActions.tsの getMembers() で条件に合う Member のみを取得できます。
type UserFilters = {
  ageRange: number[];
  orderBy: string;
  gender: string[];
  withPhoto: boolean;
};

// 128 (Adding a pagination store)
// これらの値が query parameter として設定されます。?pageSize=3&pageNumber=1
type PagingParams = {
  // 1ページに表示するアイテムの数です。
  pageSize: number;
  // 現在表示しているページの番号です。
  pageNumber: number;
};

// 128 (Adding a pagination store)
// この型は PagingParams を拡張し、ページネーションの結果に関する追加情報を含みます。
type PagingResult = {
  // データセット全体のページ数です。
  totalPages: number;
  // データセット全体のアイテム総数です。
  totalCount: number;
} & PagingParams;

// 128 (Adding a pagination store)
// これはジェネリック型で、ページネーションされたデータの応答を表します。
// T: ページネーションされるアイテムの型です（例: Member）。
type PaginatedResponse<T> = {
  // 現在のページに含まれるアイテムの配列です
  items: T[];
  // データセット全体のアイテム総数です。
  totalCount: number;
};

// 130 (Adding the pagination functionality Part 2)
// 135 (Challenge solution)

// 130 までは　<Filters/> の props において、type UserFilters を query parameter
// として使用していましたが、実際は query parameter は string type なので、
// string のみで query parameter を定義します。
type GetMemberParams = {
  ageRange?: string;
  gender?: string;
  pageNumber?: string;
  pageSize?: string;
  orderBy?: string;
  withPhoto?: string;
};
