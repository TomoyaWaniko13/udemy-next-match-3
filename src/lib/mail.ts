import { Resend } from 'resend';

// 144. Adding an email provider
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  // この token がデータベースの token と同じであれば、
  // email が verified されているとわかります。

  const link = `http://localhost:3000/verify-email?token=${token}`;

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

  // return resend.emails.send({
  //   from: 'onboarding@resend.dev',
  //   to: 'alligatorfree12@gmail.com',
  //   subject: 'Hello World',
  //   html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
  // });
}
