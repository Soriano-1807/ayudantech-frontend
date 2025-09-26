import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AyudanTech - Sistema de Gestión de Ayudantías UNIMET",
  description: "Plataforma moderna para la gestión eficiente de ayudantías universitarias en la UNIMET",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
