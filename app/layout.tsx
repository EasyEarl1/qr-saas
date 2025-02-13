import "@/styles/globals.css"
import { Montserrat } from "next/font/google"
import type { Metadata } from 'next'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '700', '900']
})

export const metadata: Metadata = {
  title: 'SnappyQR - Beautiful QR Code Generator',
  description: 'Create stunning QR codes instantly. Simple, fast, and beautiful.',
  keywords: ['QR code', 'QR generator', 'QR code maker', 'custom QR code'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>{children}</body>
    </html>
  )
} 