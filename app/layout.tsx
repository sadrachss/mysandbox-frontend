import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MySandbox.codes - Link Hub for Developers',
  description: 'Create your developer link hub with custom themes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
    <body className={inter.className} suppressHydrationWarning>
    <Providers>{children}</Providers>
    <Toaster />
    </body>
    </html>
  );
}
