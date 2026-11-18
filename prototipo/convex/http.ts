// HTTP routes: Convex Auth endpoints (Google sign-in callback, token keys) and the client
// portal's file downloads.
import { httpRouter } from 'convex/server';
import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { auth } from './auth';

const http = httpRouter();

auth.addHttpRoutes(http);

// Portal files are served only through this route, to a signed-in person who may see the deal:
// the page sends its session token in the Authorization header and gets the file back. Stored
// files have no public link.
const cors = (req: Request): Record<string, string> => {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = (process.env.SITE_URL ?? '').replace(/\/$/, '');
  return origin && origin === allowed
    ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization', 'Access-Control-Allow-Methods': 'GET', Vary: 'Origin' }
    : { Vary: 'Origin' };
};

http.route({
  path: '/portal/file',
  method: 'OPTIONS',
  handler: httpAction(async (_ctx, req) => new Response(null, { status: 204, headers: { ...cors(req), 'Access-Control-Max-Age': '600' } })),
});

http.route({
  path: '/portal/file',
  method: 'GET',
  handler: httpAction(async (ctx, req) => {
    const headers = { ...cors(req), 'Cache-Control': 'private, no-store' };
    const docId = new URL(req.url).searchParams.get('id') ?? '';
    const file = docId ? await ctx.runQuery(internal.portal.fileFor, { docId }) : null;
    if (!file) return new Response('Not found', { status: 404, headers });
    const blob = await ctx.storage.get(file.storageId);
    if (!blob) return new Response('Not found', { status: 404, headers });
    return new Response(blob, {
      headers: {
        ...headers,
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }),
});

export default http;
