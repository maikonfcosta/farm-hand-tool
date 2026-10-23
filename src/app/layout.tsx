import type { Metadata, Viewport } from 'next';
import { Chango, Josefin_Sans } from 'next/font/google';
import './globals.css';
const body = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
const heading = Chango({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-heading',
  display: 'swap',
});
export const metadata: Metadata = {
  title: 'Farm Hand Tracker',
  description:
    'Controle de tokens e consulta rápida para suas partidas de Farm Hand.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'FH Tracker' },
  icons: { icon: '/icons/icon.svg', apple: '/icons/icon-192.png' },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#25756D',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${body.variable} ${heading.variable}`}>
      <body>{children}</body>
    </html>
  );
}
