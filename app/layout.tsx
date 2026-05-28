import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quran SM Download - Beautiful Quran Videos for Social Media',
  description: 'Create and download beautiful Quran recitation videos for social media. Choose from multiple reciters and stunning backgrounds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
