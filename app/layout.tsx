import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Whoop Vitae - Nutrition & Recovery',
  description: 'Personalized nutrition recommendations based on your WHOOP data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-whoop-black text-whoop-text min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
