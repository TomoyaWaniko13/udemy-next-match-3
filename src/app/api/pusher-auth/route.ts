import { auth } from '@/auth';
import { pusherServer } from '@/lib/pusher';
import { NextResponse } from 'next/server';

// 102 (Setting up presence)
export async function POST(request: Request) {
  try {
    // 現在のセッションを非同期で取得します。これはユーザーが認証されているかを確認するために使用されます。
    const session = await auth();

    // セッションやユーザーID(session?.user?.id)が存在しない場合、401 Unauthorizedレスポンスを返します。
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // request.formData() メソッドは Request オブジェクトの標準メソッドです。
    // リクエストボディの読み取りと解析には時間がかかる可能性があるので、formData() メソッドは非同期（Promise-based）です。
    const body = await request.formData();

    // フォームデータからsocket_idとchannel_nameを取得します。
    // body.get() メソッドは、デフォルトで string | null 型を返します。
    // しかし、この場合、開発者は値が常に存在し、文字列であることを確信しています。
    // なのでas stringでnull の可能性を排除します。
    const socketId = body.get('socket_id') as string;
    const channel = body.get('channel_name') as string;
    // ユーザーIDを含むデータオブジェクトを作成します。これは"チャンネル認証"
    // (=特定のユーザーが特定のチャンネル（特にプライベートチャンネルやプレゼンスチャンネル）にアクセスする権限があるかを確認するプロセス)
    // に使用されます。
    // チャンネル認証に必要な要素：
    // a. クライアントサイド：
    // socket_id：クライアントの一意の識別子
    // channel_name：アクセスしようとしているチャンネルの名前
    //
    // b. サーバーサイド：
    // ユーザーの認証情報（この場合、session.user.id）
    // Pusherアプリケーションの秘密鍵
    const data = {
      user_id: session.user.id,
    };

    // PusherサーバーのauthorizeChannelメソッドを呼び出して、チャンネルの認証を行います。
    const authResponse = pusherServer.authorizeChannel(socketId, channel, data);

    // 認証レスポンスをJSON形式で返します。
    return NextResponse.json(authResponse);
  } catch (error) {}
}
