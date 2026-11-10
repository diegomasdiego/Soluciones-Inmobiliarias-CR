// Sends email through the Resend REST API. Shared by the new-request notice and the sign-in codes.
//   RESEND_API_KEY  required (npx convex env set RESEND_API_KEY re_...   add --prod for production)
//   NOTIFY_FROM     optional sender, needs a domain verified in Resend. Without it Resend's test
//                   sender is used, which only delivers to the email of the Resend account owner.

export const emailEnabled = () => !!process.env.RESEND_API_KEY;

export async function sendEmail(msg: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string[];
  idempotencyKey?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(msg.idempotencyKey ? { 'Idempotency-Key': msg.idempotencyKey } : null),
    },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM ?? 'Soluciones Inmobiliarias CR <onboarding@resend.dev>',
      to: msg.to,
      ...(msg.replyTo ? { reply_to: msg.replyTo } : null),
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
