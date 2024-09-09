// 36 (Protecting routes using Middleware)
// 141 (Submitting the form)
// 145. Adding the verify email function

// publicRoutes, authRoutes 配列は middleware.ts で使用されています。

// ログインなしでもアクセスできる routes を表しています。
export const publicRoutes = ['/'];

// authentication に関わる routes を表しています。
export const authRoutes = ['/login', '/register', '/register/success', '/verify-email'];
