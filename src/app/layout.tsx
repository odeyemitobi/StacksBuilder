import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const lato = localFont({
  src: [
    {
      path: './fonts/Lato-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/Lato-ThinItalic.ttf',
      weight: '100',
      style: 'italic',
    },
    {
      path: './fonts/Lato-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Lato-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/Lato-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Lato-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/Lato-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Lato-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/Lato-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/Lato-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-lato',
});

export const metadata: Metadata = {
  title: 'StacksBuilder - Showcase Your Bitcoin Development Skills',
  description: 'The premier platform for Stacks developers to showcase their work, connect with opportunities, and build their reputation in the Bitcoin ecosystem.',
  keywords: ['Stacks', 'Bitcoin', 'Blockchain', 'Developer', 'Portfolio', 'Web3', 'Clarity'],
  authors: [{ name: 'StacksBuilder Team' }],
  creator: 'StacksBuilder',
  publisher: 'StacksBuilder',
  icons: {
    icon: '/single-favicon.png',
    shortcut: '/single-favicon.png',
    apple: '/single-favicon.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'StacksBuilder - Showcase Your Bitcoin Development Skills',
    description: 'The premier platform for Stacks developers to showcase their work and connect with opportunities.',
    url: '/',
    siteName: 'StacksBuilder',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StacksBuilder - Developer Showcase Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StacksBuilder - Showcase Your Bitcoin Development Skills',
    description: 'The premier platform for Stacks developers to showcase their work and connect with opportunities.',
    images: ['/og-image.png'],
    creator: '@stacksbuilder', // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification tokens here
    // google: 'your-google-verification-token',
    // yandex: 'your-yandex-verification-token',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${lato.className} h-full flex flex-col`} suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
