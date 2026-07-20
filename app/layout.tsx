import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ATLAS Predictive Scenario Workspace',
  description: 'CNO alert triage, predictive scenario modeling, buying group intelligence, source trust, and debrief memory'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
