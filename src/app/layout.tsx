import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Neo Life OS',
  description: 'Personal productivity OS — NeoGurpreet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#06070E] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
