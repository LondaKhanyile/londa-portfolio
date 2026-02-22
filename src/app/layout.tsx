import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Londa's Portfolio",
  description: "Personal portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} max-md:h-screen max-md:overflow-hidden`}>
      <body className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.24),transparent)] font-sans antialiased max-md:h-screen max-md:overflow-hidden">
        {children}
      </body>
    </html>
  );
}
