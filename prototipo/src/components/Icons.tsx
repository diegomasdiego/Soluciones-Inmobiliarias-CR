import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
});

export const IconHeart = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6z" /></svg>;
export const IconCheck = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M20 6 9 17l-5-5" /></svg>;
export const IconShield = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>;
export const IconArrow = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const IconArrowLeft = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>;
export const IconSearch = ({ size, ...p }: P) => <svg {...base(size)} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const IconSpark = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>;
export const IconBed = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 14h18M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg>;
export const IconBath = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" /></svg>;
export const IconArea = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M4 4h16v16H4zM4 9h5M15 4v5" /></svg>;
export const IconLot = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M3 17 9 7l4 6 3-4 5 8z" /><path d="M3 20h18" /></svg>;
export const IconPlay = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M7 5v14l12-7z" /></svg>;
export const IconPause = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M8 5v14M16 5v14" /></svg>;
export const IconClose = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconMenu = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export const IconPlane = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M10.5 13.5 3 11l1.5-1.5 7 1 4-4.5c1-1 2.5-1.5 3.5-.5s.5 2.5-.5 3.5l-4.5 4 1 7L13.5 21 11 13.5" /></svg>;
export const IconPin = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
export const IconVideo = ({ size, ...p }: P) => <svg {...base(size)} {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>;
export const IconCube = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9" /></svg>;
export const IconPlan = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M3 4h18v16H3zM3 12h7v8M10 4v5M14 12h7M14 12v3" /></svg>;
export const IconPhotos = ({ size, ...p }: P) => <svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="m21 16-5-5-8 8" /></svg>;
export const IconCalc = ({ size, ...p }: P) => <svg {...base(size)} {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h2M12 11h2M16 11v6M8 15h2M12 15h2M8 18h6" /></svg>;
export const IconMail = ({ size, ...p }: P) => <svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
export const IconPhone = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>;
export const IconExcavator = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M3 18h11M4 18a2 2 0 1 0 0 .01M12 18a2 2 0 1 0 0 .01M5 14h8v-4H8l-3 4zM13 12l4-6 3 2-1 5h-2" /></svg>;
export const IconTruck = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>;
export const IconFilter = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
export const IconMap = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /></svg>;
export const IconList = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></svg>;
export const IconExpand = ({ size, ...p }: P) => <svg {...base(size)} {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>;
