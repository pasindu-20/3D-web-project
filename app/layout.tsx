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
  title: {
    default: "AUREL | The Machine",
    template: "%s | AUREL",
  },
  description:
    "AUREL is a cinematic automotive experience that blends brutalist architecture with a premium 3D Mercedes SLS showcase.",
  keywords: ["AUREL", "automotive", "Mercedes SLS", "3D showroom", "Next.js"],
  openGraph: {
    title: "AUREL | The Machine",
    description:
      "A cinematic automotive experience with premium visual storytelling and an immersive 3D garage showcase.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
