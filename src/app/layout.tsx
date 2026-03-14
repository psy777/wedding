import type { Metadata } from "next";
import { Cormorant_Garamond, Karla, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Our Wedding",
  description:
    "Join us as we celebrate our love. RSVP and find all the details for our special day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", cormorantGaramond.variable, karla.variable, "font-sans", geist.variable)}>
      <body className="antialiased">

        {children}
      </body>
    </html>
  );
}
