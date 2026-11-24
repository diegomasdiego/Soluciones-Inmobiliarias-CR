import type { ReactNode } from 'react';
import { SiteFrame } from '../../../components/SiteFrame';

/** Public pages: header, footer and the rest of the site frame around each page. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
