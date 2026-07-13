import './globals.css';
import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans, JetBrains_Mono } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700']
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['900']
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['500', '600']
});

export const metadata: Metadata = {
  title: 'ATLAS Europe CNO Intelligence Hub',
  description: 'European CNO intelligence, source trust and financial impact prototype'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable}`}>{children}</body>
    </html>
  );
}
