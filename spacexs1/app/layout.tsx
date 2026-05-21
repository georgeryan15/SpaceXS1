import type { Metadata } from "next";
import { Chakra_Petch, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const display = Chakra_Petch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPX // S-1",
  description:
    "Interactive chat for interrogating the SpaceX S-1 registration statement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body tracking-tight bg-bg text-fg">
        <div className="w-full bg-green-600 text-white text-center text-xs font-medium py-1 px-4">
          We&apos;ve fixed a rate limit error appearing on some chat messages
        </div>
        {children}
      </body>
    </html>
  );
}
