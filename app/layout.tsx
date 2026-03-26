import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PSL Predictor',
  description: 'Predict PSL match winners and compete with friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
