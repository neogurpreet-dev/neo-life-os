import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NeoGurpreet — Life OS',
  description: 'Personal productivity OS · IIT Roorkee',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
