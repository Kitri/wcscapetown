import type { Metadata } from "next";
import { League_Spartan, Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en">
      <body
        className={`${leagueSpartan.variable} ${inter.variable} antialiased bg-cloud-dancer text-text-dark`}
      >
        {children}
      </body>
    </html>
  );
}
