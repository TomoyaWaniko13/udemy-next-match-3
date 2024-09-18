import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// 97 (Setting up Pusher)
// declare global は、既存のグローバル名前空間（この場合はglobalオブジェクト）に新しいプロパティを追加することを TypeScript に伝えます。
// pusherServerInstance と pusherClientInstance という2つの変数をグローバルスコープに追加しています。
// これらの変数の型を PusherServer | undefined と PusherClient | undefined として定義しています。
declare global {
  var pusherServerInstance: PusherServer | undefined;
  var pusherClientInstance: PusherClient | undefined;
}

// if (!global.pusherServerInstance) は、グローバル変数 pusherServerInstance がまだ存在しないかどうかをチェックします。
// これにより、アプリケーションの生存期間中に一度だけインスタンスが作成されることを保証します。
if (!global.pusherServerInstance) {
  global.pusherServerInstance = new PusherServer({
    //　Pusherアプリケーションの一意のID。
    appId: process.env.PUSHER_APP_ID as string,
    // Pusherアプリケーションの公開キー。
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
    //　Pusherアプリケーションの秘密キー。
    secret: process.env.PUSHER_SECRET as string,
    //　Pusherのデータセンターの地理的位置。ここでは 'ap3' (おそらくAsia Pacific 3) を指定しています。
    cluster: 'ap3',
    // セキュアな接続（HTTPS）を使用するかどうか。true に設定されているので、セキュアな接続を使用します。
    useTLS: true,
  });
}

// if (!global.pusherClientInstance) は、グローバル変数 pusherClientInstance がまだ存在しないかどうかをチェックします。
// これにより、アプリケーションの生存期間中に一度だけインスタンスが作成されることを保証します。
if (!global.pusherClientInstance) {
  // new PusherClient(...) で、新しいPusherクライアントインスタンスを作成しています。
  global.pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    // https://pusher.com/docs/channels/server_api/authorizing-users/#client-side-setting-the-authorization-endpoint
    // 102 (Setting up presence)
    // クライアントがプライベートまたはプレゼンスチャンネルに接続しようとすると、Pusherは自動的に認証プロセスを開始します。
    // クライアントは指定されたエンドポイント（この場合は'/api/pusher-auth'）に認証リクエストを送信します。
    // サーバーサイドでこのリクエストを処理し、ユーザーの認証状態を確認します。
    // 認証が成功すれば、クライアントはチャンネルに接続できます。
    channelAuthorization: {
      // これは認証リクエストを送信するサーバーエンドポイントのURLを指定しています。
      endpoint: '/api/pusher-auth',
      // これは認証リクエストの送信方法を指定しています。
      // ajaxは、非同期のJavaScriptとXMLを使用してサーバーとデータをやり取りする方法を指します。
      transport: 'ajax',
    },
    cluster: 'ap3',
  });
}

export const pusherServer = global.pusherServerInstance;
export const pusherClient = global.pusherClientInstance;
