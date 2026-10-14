import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fideliza - Gana puntos, redime experiencias",
  description: "Fideliza es la plataforma de fidelización para tu comercio.",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#4e6d58",
  openGraph: {
    title: "Fideliza - Gana puntos, redime experiencias",
    description: "Fideliza es la plataforma de fidelización para tu comercio.",
    url: "https://www.fidelizaaa.com",
    siteName: "Fideliza",
    images: [
      {
        url: "/logo-fideliza.png",
        width: 600,
        height: 315,
        alt: "Logo Fideliza",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fideliza - Gana puntos, redime experiencias",
    description: "Fideliza es la plataforma de fidelización para tu comercio.",
    images: ["/logo-fideliza.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
      <meta name="color-scheme" content="light" />
        <script
          src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
          async
        ></script>
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
