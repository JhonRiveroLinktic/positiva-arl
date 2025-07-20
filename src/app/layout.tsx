import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Positiva - Sistema de Gestión',
  description: 'Sistema de gestión de datos para Positiva',
  generator: 'v0.dev',
  icons: {
    icon: '/positiva-circulo.png',
    shortcut: '/positiva-circulo.png',
    apple: '/positiva-circulo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
