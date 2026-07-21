import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ATLAS Predictive Scenario Workspace',
  description: 'CNO alert triage, predictive scenario modeling, buying group intelligence, source trust, and debrief memory'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
