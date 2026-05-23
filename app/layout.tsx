import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://ikemen-date.vercel.app'),
  title: "イケメンデート",
  description: "イケメン男性と出会いたい女性向けのマッチングアプリ",
  openGraph: {
    title: "イケメンデート",
    description: "イケメン男性と出会いたい女性向けのマッチングアプリ",
    url: "https://ikemen-date.vercel.app",
    siteName: "イケメンデート",
    images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "イケメンデート" }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "イケメンデート",
    description: "イケメン男性と出会いたい女性向けのマッチングアプリ",
    images: ["/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
