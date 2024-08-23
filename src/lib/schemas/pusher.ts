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
    appId: process.env.PUSHER_APP_ID,
    // Pusherアプリケーションの公開キー。
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    //　Pusherアプリケーションの秘密キー。
    secret: process.env.PUSHER_SECRET,
    //　Pusherのデータセンターの地理的位置。ここでは 'ap1' (おそらくAsia Pacific 1) を指定しています。
    cluster: 'ap1',
    // セキュアな接続（HTTPS）を使用するかどうか。true に設定されているので、セキュアな接続を使用します。
    useTLS: true,
  });
}

// if (!global.pusherClientInstance) は、グローバル変数 pusherClientInstance がまだ存在しないかどうかをチェックします。
// これにより、アプリケーションの生存期間中に一度だけインスタンスが作成されることを保証します。
if (!global.pusherClientInstance) {
  // new PusherClient(...) で、新しいPusherクライアントインスタンスを作成しています。
  global.pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: 'ap1',
  });
}

export const pusherServer = global.pusherServerInstance;
export const pusherClient = global.pusherClientInstance;
