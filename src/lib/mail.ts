import { Resend } from 'resend';

// 144. Adding an email provider
const resend = new Resend(process.env.RESEND_API_KEY);

// ユーザーのメールアドレスを検証するためのメールを送信します。
// ユーザーのメールアドレスと検証用のトークンを引数として受け取ります。
export async function sendVerificationEmail(email: string, token: string) {
  // 検証用のリンクを生成します。このリンクには、トークンがクエリパラメータとして含まれています。
  // この token がデータベースの token と同じであれば、email が verified されているとわかります。
  const link = `http://localhost:3000/verify-email?token=${token}`;

  // Resendというメール送信サービスを使用して、検証メールを作成し送信します。
  return resend.emails.send({
    from: 'testing@resend.dev',
    to: email,
    subject: 'Verify your email address',
    html: `
           <h1>Verify your email address</h1>
           <p>Click the link below to verify your email address</p>
           <a href="${link}">Verify email</a>
          `,
  });
}

// 146. Adding the forgot password functionality part 1
export async function sendPasswordResetEmail(email: string, token: string) {
  // 検証用のリンクを生成します。このリンクには、トークンがクエリパラメータとして含まれています。
  // この token がデータベースの token と同じであれば、email が verified されているとわかります。
  const link = `http://localhost:3000/reset-password?token=${token}`;

  // Resendというメール送信サービスを使用して、検証メールを作成し送信します。
  return resend.emails.send({
    from: 'testing@resend.dev',
    to: email,
    subject: 'Reset your password',
    html: `
           <h1>Verify your email address</h1>
           <p>Click the link below to reset password</p>
           <a href="${link}">Reset password</a>
          `,
  });
}
