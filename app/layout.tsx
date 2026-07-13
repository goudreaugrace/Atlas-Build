import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ATLAS Europe CNO Intelligence Hub',
  description: 'European CNO intelligence, source trust and financial impact prototype'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
