import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]">
        {children}
      </body>
    </html>
  );
}
