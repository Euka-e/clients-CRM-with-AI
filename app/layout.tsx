import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ConvexClientProvider } from "@/lib/convex"
import "./globals.css"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export const metadata: Metadata = {
  title: "CRM Pro - Customer Relationship Management",
  description: "CRM inteligente con IA para gestión de clientes en tiempo real",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ConvexClientProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </ConvexClientProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <Analytics />
      </body>
    </html>
  )
}
