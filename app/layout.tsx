import type React from 'react';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { FirebaseProvider } from '@/components/firebase-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Marknadsplatsen',
  description: 'A marketplace for limited-time deals',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <LanguageProvider>
            <FirebaseProvider>
              {children}
              <Toaster />
            </FirebaseProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
