import type { Metadata } from 'next';
// @ts-ignore
import './globals.css';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'POS Frontend',
  description: 'HQ and outlet POS frontend'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
