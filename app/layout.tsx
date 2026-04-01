import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Inventario de Equipos',
  description: 'Sistema de gestion de inventario de equipos del departamento',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon_minas.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon_minas_dark.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon_minas.png',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon-180x180.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
