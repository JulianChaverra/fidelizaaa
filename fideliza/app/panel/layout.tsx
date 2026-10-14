import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ServiceWorkerComercio from "../components/ServiceWorkerComercio"; // lo creas tú

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panel de Comercio | Fideliza",
  description: "Administra tus clientes y premios desde Fideliza.",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#4e6d58",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest-comercio.json" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerComercio />
        {children}
      </body>
    </html>
  );
}
