import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { CORE_BIOMARKERS } from '@/lib/content';
import './globals.css';

const figtree = localFont({
  src: './fonts/Figtree-VariableFont_wght.ttf',
  weight: '300 900',
  display: 'swap',
  variable: '--font-figtree',
  // Size-adjusted fallback avoids layout shift while the font loads.
  adjustFontFallback: 'Arial',
});

const description =
  `Join the TruDoc Gold waitlist. ${CORE_BIOMARKERS} biomarkers tested twice a year, reviewed with a doctor, from AED 1/day at launch pricing.`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'TruDoc Gold — Waitlist',
  description,
  openGraph: { title: 'TruDoc Gold — Waitlist', description, type: 'website' },
  twitter: { card: 'summary_large_image', title: 'TruDoc Gold — Waitlist', description },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#010102',
};

// Runs before first paint so the intro reveal never flashes content. Skipped under reduced motion.
const introScript = `try{if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)&&!/[?&]join=/.test(location.search)){document.documentElement.classList.add('td-intro')}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
