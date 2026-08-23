import type { Metadata } from 'next';
import './globals.css';
import AppShell from '../components/layout/AppShell';

export const metadata: Metadata = {
  title: 'MilkTrace — Maharashtra Milk Supply Chain',
  description:
    'MilkTrace is a Maharashtra-wide milk traceability and food-safety monitoring platform for real-time supply chain visibility.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
