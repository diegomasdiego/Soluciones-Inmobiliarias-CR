// Emails the team when a new request arrives, through the Resend REST API.
// Configure per deployment (dev and prod) with:
//   npx convex env set RESEND_API_KEY re_...            (add --prod for production)
//   npx convex env set NOTIFY_EMAIL ventas@ejemplo.com  (comma-separated for several people)
//   npx convex env set NOTIFY_FROM "Soluciones Inmobiliarias CR <avisos@su-dominio.cr>"   (optional)
// Without RESEND_API_KEY or NOTIFY_EMAIL the request is still saved; only the email is skipped.
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction } from './_generated/server';
import { emailEnabled, escapeHtml, sendEmail } from './mail';

const interestLabel: Record<string, string> = {
  home: 'Comprar una casa',
  land: 'Comprar un lote o una finca',
  invest: 'Invertir / alquileres',
  sell: 'Vender su propiedad',
  build: 'Land & Build (maquinaria)',
  other: 'Otra consulta',
};
const budgetLabel: Record<string, string> = {
  lt150: 'Menos de $150.000',
  '150-300': '$150.000 – $300.000',
  '300-500': '$300.000 – $500.000',
  gt500: 'Más de $500.000',
};
const viaLabel: Record<string, string> = { email: 'Correo', whatsapp: 'WhatsApp', video: 'Videollamada' };

export const newLead = internalAction({
  args: { leadId: v.id('leads') },
  handler: async (ctx, { leadId }) => {
    const to = (process.env.NOTIFY_EMAIL ?? '').split(',').map(s => s.trim()).filter(Boolean);
    if (!emailEnabled() || to.length === 0) {
      console.log('Email notifications are off: set RESEND_API_KEY and NOTIFY_EMAIL to enable them.');
      return;
    }
    const lead = await ctx.runQuery(internal.leads.get, { id: leadId });
    if (!lead) return;

    const rows: [string, string | undefined][] = [
      ['Nombre', lead.name],
      ['Correo', lead.email],
      ['Teléfono / WhatsApp', lead.phone],
      ['Interés', interestLabel[lead.interest] ?? lead.interest],
      ['Presupuesto', lead.budget ? budgetLabel[lead.budget] ?? lead.budget : undefined],
      ['Prefiere contacto por', viaLabel[lead.via] ?? lead.via],
      ['Sobre', lead.context],
      ['Idioma del visitante', lead.lang === 'es' ? 'Español' : 'Inglés'],
      ['Página', lead.page],
      ['Recibida', new Date(lead._creationTime).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })],
    ];
    const filled = rows.filter((r): r is [string, string] => !!r[1]);
    const text = [
      'Nueva solicitud desde el sitio web',
      '',
      ...filled.map(([k, val]) => `${k}: ${val}`),
      '',
      'Mensaje:',
      lead.message ?? '(sin mensaje)',
      '',
      'Responda a este correo para escribirle directamente al cliente.',
    ].join('\n');
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#151B18;max-width:560px">
<h2 style="font-weight:normal;color:#1E4A3B;margin:0 0 16px">Nueva solicitud desde el sitio web</h2>
<table style="border-collapse:collapse;width:100%">${filled
      .map(([k, val]) => `<tr><td style="padding:6px 12px 6px 0;color:#69746D;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(val)}</td></tr>`)
      .join('')}</table>
<p style="margin:20px 0 6px;color:#69746D">Mensaje</p>
<p style="margin:0;white-space:pre-wrap;background:#EDF0EB;padding:12px;border-radius:8px">${escapeHtml(lead.message ?? '(sin mensaje)')}</p>
<p style="margin:20px 0 0;font-size:13px;color:#69746D">Responda a este correo para escribirle directamente al cliente.</p>
</div>`;

    // A failure throws, so it shows in the Convex logs; the request itself is already saved.
    await sendEmail({
      to,
      replyTo: [lead.email],
      subject: `Nueva solicitud: ${lead.name} · ${interestLabel[lead.interest] ?? lead.interest}`,
      text,
      html,
      idempotencyKey: `lead-${leadId}`,
    });
    await ctx.runMutation(internal.leads.markNotified, { id: leadId });
  },
});
