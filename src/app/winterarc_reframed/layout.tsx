import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Winter Arc (Reframed) · Neo Life OS',
  description: '92-day Winter Arc tracker: daily log, scoring, streaks and charts.',
};

export default function WinterArcLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
