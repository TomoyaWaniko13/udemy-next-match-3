import { auth } from '@/auth';
import { pusherServer } from '@/lib/pusher';
import { NextResponse } from 'next/server';

// 102 (Setting up presence)
// https://pusher.com/docs/channels/server_api/authorizing-users/

// プロセスの流れ:
// a. クライアントがプライベート/プレゼンスチャンネルへの接続を試みる
// b. Pusherライブラリがこの認証エンドポイントにリクエストを送信
// c. サーバーが authorizeChannel() を呼び出して認証情報を生成
// d. 生成された認証情報がクライアントに返される
// e. クライアントが認証情報を使用してPusherサーバーに接続
export async function POST(request: Request) {
  try {
    // 現在のセッションを非同期で取得します。
    // これはユーザーが認証されているかを確認するために使用されます。
    const session = await auth();

    // セッション や ユーザーID (session?.user?.id) が存在しない場合、つまり認証されていない場合、
    // 401 Unauthorizedレスポンスを返します。
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // request.formData() メソッドは Request オブジェクトの標準メソッドです。
    // リクエストボディの読み取りと解析には時間がかかる可能性があるので、
    // formData() メソッドは非同期（Promise-based）です。
    const body = await request.formData();

    // フォームデータからsocket_idとchannel_nameを取得します。
    // body.get() メソッドは、デフォルトで string | null 型を返します。
    // しかし、この場合、開発者は値が常に存在し、文字列であることを確信しています。
    // なのでas stringでnull の可能性を排除します。
    const socketId = body.get('socket_id') as string;
    const channel = body.get('channel_name') as string;
    // ユーザーIDを含むデータオブジェクトを作成します。これは"チャンネル認証"
    // ( = 特定のユーザーが特定のチャンネル（特にプライベートチャンネルやプレゼンスチャンネル）にアクセスする権限があるかを確認するプロセス)
    // に使用されます。
    // チャンネル認証に必要な要素：
    // a. クライアントサイド：
    // socket_id：クライアントの一意の識別子
    // channel_name：アクセスしようとしているチャンネルの名前
    // b. サーバーサイド：
    // ユーザーの認証情報（この場合、session.user.id）
    // Pusherアプリケーションの秘密鍵
    const data = {
      user_id: session.user.id,
    };

    // https://pusher.com/docs/channels/server_api/authorizing-users/
    // authorizeChannel() メソッドの主な目的は、特定のユーザーが特定のチャンネル
    // （プライベートチャンネルやプレゼンスチャンネル）にアクセスする権限があるかを確認し、必要な認証情報を生成することです。
    // このメソッドは、与えられた情報を使用して認証トークンを生成します。
    // 認証トークンは、Pusherのアプリケーションキーと秘密鍵を使用して作成される署名付きの文字列です。
    // この署名プロセスにより、認証情報が改ざんされていないことが保証されます。
    // このプロセスにより、クライアントは直接Pusherの秘密鍵にアクセスすることなく、安全に認証を行うことができます。
    // サーバーサイドでこの処理を行うことで、不正なアクセスを防ぎ、チャンネルのセキュリティを確保します。

    const authResponse = pusherServer.authorizeChannel(socketId, channel, data);

    // 認証プロセスの結果を JSON 形式でクライアントに返します。
    return NextResponse.json(authResponse);
  } catch (error) {}
}
