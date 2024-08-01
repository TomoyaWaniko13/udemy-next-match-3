import { auth } from '@/auth';
import { authRoutes, publicRoutes } from '@/routes';
import { NextResponse } from 'next/server';

// 36 (Protecting routes using Middleware)

// Auth.jsのauth middlewareを使用す流。
// req はuserがリンクをクリックした時のrequestのこと。
export default auth((req) => {
  // nextUrl: リクエストの URL 情報
  // https://nextjs.org/docs/app/api-reference/functions/next-request#nexturl
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;

  // nextUrl.pathname:
  // Given a request to /home, pathname is /home
  const isPublic = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // リクエストされた route が publicRoutes である
  if (isPublic) {
    // that just simply allows them to proceed to where they've tried to get to
    return NextResponse.next();
  }

  // リクエストされた route が authRoutes である
  if (isAuthRoute) {
    // loginしていれば、login pageやregister pageではなくmembers pageにredirectする。
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/members', nextUrl));
    }
    // loginしていなければ　authRoutesに移動
    return NextResponse.next();
  }

  // 保護されたルート（メンバーページなど）にログインしていないユーザーがアクセスしようとした場合に実行されます。
  if (!isPublic && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

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
