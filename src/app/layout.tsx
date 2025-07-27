import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from '@/lib/components/core/auth/auth-context'

export const metadata: Metadata = {
  title: 'Positiva - Sistema de Gestión',
  description: 'Sistema de gestión de datos para Positiva',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body
        className={`antialiased w-full`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-center"  />
      </body>
    </html>
  );
}