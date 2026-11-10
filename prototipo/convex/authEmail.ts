// One-time codes emailed for team sign-in: code-only sign-in, confirming the email of a new
// password account, and resetting a password. Sent with Resend (see mail.ts).
import { Email } from '@convex-dev/auth/providers/Email';
import { escapeHtml, sendEmail } from './mail';

const CODE_MINUTES = 15;

/** 8 random digits. Values at the very top of the 32-bit range are skipped so every digit is equally likely. */
function randomCode(length = 8) {
  const digits: string[] = [];
  const buf = new Uint32Array(1);
  while (digits.length < length) {
    crypto.getRandomValues(buf);
    if (buf[0] < 4_294_967_290) digits.push(String(buf[0] % 10));
  }
  return digits.join('');
}

function codeProvider(id: string, subject: string, purpose: string, purposeEn: string) {
  return Email({
    id,
    maxAge: CODE_MINUTES * 60,
    generateVerificationToken: async () => randomCode(),
    async sendVerificationRequest({ identifier, token }) {
      const text = [
        `${purpose}: ${token}`,
        `${purposeEn}: ${token}`,
        '',
        `El código vence en ${CODE_MINUTES} minutos. Si usted no lo pidió, ignore este correo.`,
        `The code expires in ${CODE_MINUTES} minutes. If you did not ask for it, ignore this email.`,
        '',
        'Soluciones Inmobiliarias CR · Panel del equipo',
      ].join('\n');
      const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#151B18;max-width:480px">
<p style="margin:0 0 6px;color:#69746D;font-size:13px;letter-spacing:.08em;text-transform:uppercase">Soluciones Inmobiliarias CR · Panel del equipo</p>
<p style="margin:0 0 18px">${escapeHtml(purpose)} <span style="color:#69746D">/ ${escapeHtml(purposeEn)}</span></p>
<p style="margin:0 0 18px;font-family:Consolas,monospace;font-size:30px;letter-spacing:.18em;background:#EDF0EB;padding:14px 18px;border-radius:10px;display:inline-block">${escapeHtml(token)}</p>
<p style="margin:0;font-size:13px;color:#69746D">El código vence en ${CODE_MINUTES} minutos. Si usted no lo pidió, ignore este correo.<br>The code expires in ${CODE_MINUTES} minutes. If you did not ask for it, ignore this email.</p>
</div>`;
      await sendEmail({ to: [identifier], subject, text, html });
    },
  });
}

export const EmailCode = codeProvider(
  'email-code',
  'Su código para entrar al panel',
  'Su código para entrar al panel',
  'Your sign-in code',
);
export const PasswordVerify = codeProvider(
  'password-verify',
  'Confirme su correo para el panel',
  'Código para confirmar su correo',
  'Code to confirm your email',
);
export const PasswordReset = codeProvider(
  'password-reset',
  'Código para cambiar su contraseña',
  'Código para cambiar su contraseña',
  'Code to reset your password',
);
