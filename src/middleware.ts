import { auth } from '@/auth';
import { authRoutes, publicRoutes } from '@/routes';
import { NextResponse } from 'next/server';

// 36 (Protecting routes using Middleware)

// Auth.js の auth middleware を使用します。
// req は user がリンクをクリックした時のリクエストです。
// https://authjs.dev/getting-started/session-management/protecting
// https://zenn.dev/tsuboi/books/3f7a3056014458

export default auth((req) => {
  // nextUrl: リクエストの URL 情報
  // https://nextjs.org/docs/app/api-reference/functions/next-request#nexturl
  const { nextUrl } = req;

  // https://authjs.dev/getting-started/session-management/protecting
  // req.auth: ユーザーが認証されている場合、この req.auth にはセッション情報が含まれます。
  //           認証されていない場合は null または undefined になります。
  //           Auth.js のミドルウェアによって提供されるプロパティです。

  // !!: 複雑なセッション情報をシンプルな真偽値に変換しています。
  //     これは二重否定演算子です。JavaScriptでは、値を真偽値（boolean）に変換するためによく使用されます。
  const isLoggedIn = !!req.auth;

  // nextUrl.pathname:
  // Given a request to /home, pathname is /home
  const isPublic = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // リクエストされた route が publicRoutes　配列に含まれている場合、
  // ログインなしでもアクセスできるルートにアクセスしようとしている場合、
  if (isPublic) {
    // リクエストされた route に移動します。
    return NextResponse.next();
  }

  // リクエストされた route が authRoutes 配列に含まれている場合、
  // つまり /login などにアクセスしようとしている場合、
  if (isAuthRoute) {
    // ログインしていれば、
    if (isLoggedIn) {
      // login page や register page ではなく, members page に redirect します。
      return NextResponse.redirect(new URL('/members', nextUrl));
    }
    // ログインしていなければ　リクエストされた route に移動します。
    return NextResponse.next();
  }

  // 保護されたルート（メンバーページなど）にログインしていないユーザーがアクセスしようとした場合,
  if (!isPublic && !isLoggedIn) {
    // login page に移動します。
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // この next() メソッドは、現在のミドルウェア処理を終了し、リクエストを次の処理段階に進めることを指示します。
  // 具体的には、ミドルウェアチェーンの次のミドルウェア（存在する場合）や、最終的にはルートハンドラーにリクエストを渡します。
  return NextResponse.next();
});

// https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes ミドルウェアを適用すると、API の動作に予期しない影響を与える可能性があります。)
     * - _next/static (static filesは通常、認証や特別な処理を必要としません)
     * - _next/image (image optimization filesも静的であり、特別な処理を必要としません。)
     * - favicon.ico (favicon fileは認証や特別な処理を必要としない単純なアイコンファイルです。)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
