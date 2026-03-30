import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'PSL Predictor',
  description: 'Predict PSL match winners and compete with friends',
  manifest: '/manifest.json',
  themeColor: '#dc2626',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PSL Predict',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                  (registration) => {
                    console.log('SW registered:', registration);
                  },
                  (err) => {
                    console.log('SW registration failed:', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
