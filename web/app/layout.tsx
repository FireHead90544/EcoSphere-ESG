import { Geist, Geist_Mono, Oxanium, Montserrat } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({subsets:['latin'],variable:'--font-heading'});

const oxanium = Oxanium({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", oxanium.variable, montserratHeading.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
