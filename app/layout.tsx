import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bharath + Vaish 💍 Countdown',
  description: 'Days, minutes, seconds, and milliseconds countdown to 30th August 2025. Pure static Next.js + Tailwind app.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen h-full antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}


