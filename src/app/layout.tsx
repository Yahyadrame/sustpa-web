import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUSTPA — Suivi des Projets Académiques",
  description:
    "Système Unifié de Suivi et de Traçabilité des Projets Académiques",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ✅ h-full sur html ET body — indispensable pour que h-screen
    // sur AppShell soit réellement contraint à la hauteur de la fenêtre.
    // Sans ça, body s'étend librement et overflow-hidden est ignoré.
    <html
      lang="fr"
      className="h-full"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`h-full ${inter.variable} ${jetbrainsMono.variable} bg-white text-foreground antialiased`}
      >
        {children}
        {/* ✅ ToastContainer retiré ici — déjà présent dans AppShell */}
      </body>
    </html>
  );
}
