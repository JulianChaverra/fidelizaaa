import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ServiceWorkerUsuario from "../components/ServiceWorkerUsuario"; // lo creas tú

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarjetas Fideliza",
  description: "Consulta tus puntos y premios en Fideliza.",
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
        <link rel="manifest" href="/manifest-usuario.json" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerUsuario />
        {children}
      </body>
    </html>
  );
}
