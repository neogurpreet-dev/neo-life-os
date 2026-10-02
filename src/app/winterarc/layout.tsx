import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Winter Arc 2026 · Neo Life OS',
  description: '92-day Winter Arc tracker: Oct 1 to Dec 31, 2026.',
};

export default function WinterArcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
