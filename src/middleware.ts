import { auth } from '@/auth';
import { authRoutes, publicRoutes } from '@/routes';
import { NextResponse } from 'next/server';

// 36 (Protecting routes using Middleware)
// 152. Social Login part 3

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

  // req.auth は Session オブジェクトです。
  // なので、user.profileCompleteを取得できます。
  const isProfileComplete = req.auth?.user.profileComplete;

  if (isPublic) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/members', nextUrl));
    }
    return NextResponse.next();
  }

  if (!isPublic && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // (Social login を利用するとこのケースが発生します)
  // ログインしているが、プロフィール情報を入力していなくて、
  // プロフィール情報入力ページ以外にアクセスしようとした場合、
  if (isLoggedIn && !isProfileComplete && nextUrl.pathname !== '/complete-profile') {
    return NextResponse.redirect(new URL('/complete-profile', nextUrl));
  }

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
