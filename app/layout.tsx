import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "web.de Morning Briefing",
  description: "Dein tägliches Briefing — übersetzt für deinen Beruf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full bg-white text-[#1a1a1a] font-sans">
        {children}
      </body>
    </html>
  );
}
