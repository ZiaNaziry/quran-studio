import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quran Studio',
  description: 'Listen to beautiful Quran recitations verse by verse. Choose from popular reciters and customize your experience.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
