import type { Metadata } from "next";
import Script from "next/script";
import { League_Spartan, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "West Coast Swing Cape Town",
  description: "WCS is a modern social dance built on connection, musicality, and improvisation. Join our small but growing community as we bring WCS to every corner of Cape Town.",
  openGraph: {
    title: "West Coast Swing Cape Town",
    description: "WCS is a modern social dance built on connection, musicality, and improvisation. Join our small but growing community as we bring WCS to every corner of Cape Town.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${leagueSpartan.variable} ${inter.variable} antialiased bg-cloud-dancer text-text-dark`}
      >
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-MK4PC9HQSE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-MK4PC9HQSE');`}
        </Script>

        {children}
        <Analytics />
      </body>
    </html>
  );
}
