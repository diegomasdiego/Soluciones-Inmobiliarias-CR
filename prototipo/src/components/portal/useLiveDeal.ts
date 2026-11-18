// A deal from Convex with its actions, for the client portal and the team panel.
// Files go up through a one-time upload URL and come down through convex/http.ts with the
// session token, so they never have a public link.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthToken } from '@convex-dev/auth/react';
import { useMutation, useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import type { PortalData } from '../../data/portal';
import { convexSiteUrl } from '../../lib/data';
import type { DealActions } from './DealView';

const TYPES: Record<string, string> = {
  pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

/** Rethrows a server error as Error(code) so the view can explain it. */
async function coded<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    throw new Error(err instanceof ConvexError ? String(err.data) : 'failed');
  }
}

export function useLiveDeal(id: Id<'deals'>) {
  const raw = useQuery(api.portal.deal, { id });
  const post = useMutation(api.portal.postUpdate);
  const uploadUrl = useMutation(api.portal.uploadUrl);
  const attach = useMutation(api.portal.attachDoc);
  const openTicket = useMutation(api.portal.openTicket);
  const markSeen = useMutation(api.portal.markSeen);
  const token = useAuthToken();
  const tokenRef = useRef(token);
  tokenRef.current = token;

  // What was new when the page opened stays marked during this visit; the server learns it was seen.
  const [seenAt, setSeenAt] = useState<number | null>(null);
  useEffect(() => {
    if (raw && seenAt === null) {
      setSeenAt(raw.seenAt);
      void markSeen({ id }).catch(() => undefined);
    }
  }, [raw, seenAt, id, markSeen]);

  const actions = useMemo<DealActions>(() => ({
    post: async text => { await coded(() => post({ id, text })); },
    openTicket: async (title, detail) => { await coded(() => openTicket({ id, title, detail: detail || undefined })); },
    upload: async (file, category) => {
      const url = await coded(() => uploadUrl({ id }));
      const type = file.type || TYPES[(file.name.split('.').pop() ?? '').toLowerCase()] || 'application/octet-stream';
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': type }, body: file });
      if (!res.ok) throw new Error('failed');
      const { storageId } = (await res.json()) as { storageId: Id<'_storage'> };
      const result = await coded(() => attach({ id, storageId, name: file.name, category }));
      if (!result.ok) throw new Error(result.error);
    },
    download: async doc => {
      const res = await fetch(`${convexSiteUrl}/portal/file?id=${encodeURIComponent(doc._id)}`, {
        headers: tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {},
      });
      if (!res.ok) throw new Error('failed');
      const href = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = href;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
    },
  }), [id, post, openTicket, uploadUrl, attach]);

  const data: PortalData | null | undefined = raw === undefined ? undefined : raw === null ? null : ({ ...raw, seenAt: seenAt ?? raw.seenAt } as PortalData);
  return { data, actions };
}
