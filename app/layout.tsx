import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Forcecraver Interview Portal | Active Client Interview Schedules',
  description: 'Live interview schedules and candidate timelines for Forcecraver client companies.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
