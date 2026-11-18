// Client portal emails (through Resend, see mail.ts). Without RESEND_API_KEY they are skipped and
// the portal works the same. Emails to clients never carry the content itself (amounts, files,
// messages): only that there is something new, and the link to sign in.
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction, internalQuery } from './_generated/server';
import { emailEnabled, escapeHtml, sendEmail } from './mail';

const site = () => (process.env.SITE_URL ?? '').replace(/\/$/, '');

export const context = internalQuery({
  args: { dealId: v.id('deals') },
  handler: async (ctx, { dealId }) => {
    const deal = await ctx.db.get(dealId);
    if (!deal) return null;
    const people = await ctx.db.query('dealAccess').withIndex('by_deal', q => q.eq('dealId', dealId)).collect();
    const last = await ctx.db.query('dealUpdates').withIndex('by_deal', q => q.eq('dealId', dealId)).order('desc').first();
    return { deal, emails: people.map(p => p.email), lastClientMessage: last?.byClient ? last.text : null };
  },
});

function layout(title: string, paragraphs: string[], link: string, button: string) {
  const text = [title, '', ...paragraphs, '', `${button}: ${link}`].join('\n');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#151B18;max-width:560px">
<h2 style="font-weight:normal;color:#1E4A3B;margin:0 0 16px">${escapeHtml(title)}</h2>
${paragraphs.map(p => `<p style="margin:0 0 12px;line-height:1.5">${escapeHtml(p)}</p>`).join('')}
<p style="margin:20px 0"><a href="${escapeHtml(link)}" style="background:#1E4A3B;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;display:inline-block">${escapeHtml(button)}</a></p>
<p style="margin:0;font-size:13px;color:#69746D">Soluciones Inmobiliarias CR</p>
</div>`;
  return { text, html };
}

/** First email to people added to a deal: how to get in. */
export const invite = internalAction({
  args: { dealId: v.id('deals'), emails: v.array(v.string()) },
  handler: async (ctx, { dealId, emails }) => {
    if (!emailEnabled()) { console.log('Portal invitation not sent: RESEND_API_KEY is not set.'); return; }
    const c = await ctx.runQuery(internal.portalNotify.context, { dealId });
    if (!c) return;
    const es = c.deal.lang === 'es';
    const link = `${site()}/#portal`;
    const what = c.deal.kind === 'purchase'
      ? (es ? `el avance de la compra de ${c.deal.title}` : `the progress of your purchase of ${c.deal.title}`)
      : (es ? `los reportes y el mantenimiento de ${c.deal.title}` : `the reports and maintenance of ${c.deal.title}`);
    const { text, html } = layout(
      es ? 'Su portal de cliente está listo' : 'Your client portal is ready',
      es
        ? [`En el portal puede seguir ${what}, ver y enviar documentos y escribirle al equipo.`, 'Entre con este mismo correo: le enviaremos un código cada vez, o puede crear una contraseña.']
        : [`In the portal you can follow ${what}, see and send documents, and write to the team.`, 'Sign in with this same email: we send you a code each time, or you can create a password.'],
      link,
      es ? 'Entrar al portal' : 'Open the portal',
    );
    for (const to of emails) {
      await sendEmail({ to: [to], subject: es ? 'Su portal de cliente · Soluciones Inmobiliarias CR' : 'Your client portal · Soluciones Inmobiliarias CR', text, html, idempotencyKey: `invite-${dealId}-${to}` });
    }
  },
});

/** The team changed something: tell the clients there is news (no details). */
export const toClients = internalAction({
  args: { dealId: v.id('deals') },
  handler: async (ctx, { dealId }) => {
    if (!emailEnabled()) return;
    const c = await ctx.runQuery(internal.portalNotify.context, { dealId });
    if (!c || c.emails.length === 0) return;
    const es = c.deal.lang === 'es';
    const { text, html } = layout(
      es ? `Novedades: ${c.deal.title}` : `News: ${c.deal.title}`,
      [es ? 'El equipo actualizó su expediente en el portal de cliente.' : 'The team updated your file in the client portal.'],
      `${site()}/#portal`,
      es ? 'Ver en el portal' : 'See it in the portal',
    );
    await sendEmail({ to: c.emails, subject: es ? `Novedades en el portal · ${c.deal.title}` : `News in your portal · ${c.deal.title}`, text, html });
  },
});

const whatLabel: Record<string, string> = {
  message: 'escribió un mensaje',
  file: 'subió un documento',
  ticket: 'reportó algo para mantenimiento',
};

/** A client did something: tell the team (NOTIFY_EMAIL), with the message when there is one. */
export const toTeam = internalAction({
  args: { dealId: v.id('deals'), what: v.string(), by: v.string() },
  handler: async (ctx, { dealId, what, by }) => {
    const to = (process.env.NOTIFY_EMAIL ?? '').split(',').map(s => s.trim()).filter(Boolean);
    if (!emailEnabled() || to.length === 0) return;
    const c = await ctx.runQuery(internal.portalNotify.context, { dealId });
    if (!c) return;
    const lines = [`${by} ${whatLabel[what] ?? 'hizo un cambio'} en "${c.deal.title}" (${c.deal.clientName}).`];
    if (what === 'message' && c.lastClientMessage) lines.push(c.lastClientMessage);
    const { text, html } = layout(`Portal de clientes: ${c.deal.title}`, lines, `${site()}/#panel`, 'Abrir el panel');
    await sendEmail({ to, replyTo: [by], subject: `Portal: ${c.deal.clientName} ${whatLabel[what] ?? 'hizo un cambio'}`, text, html });
  },
});
