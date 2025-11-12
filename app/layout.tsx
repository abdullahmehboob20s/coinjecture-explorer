import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import QueryClientProvider from "@/components/QueryClientProvider";
import Header from "@/components/Header";
import Layout from "@/components/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COINjecture — Utility-Based Computational Work Blockchain ($BEANS)",
  description:
    "COINjecture is a utility-based blockchain that proves computational work through NP-Complete problem solving. Built on Satoshi's foundation, evolved with complexity theory, and driven by real-world utility.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "COINjecture — Utility-Based Computational Work Blockchain ($BEANS)",
    description:
      "Built on Satoshi's foundation. Evolved with complexity theory. Driven by real-world utility. Solve verifiable NP-Complete problems for real value.",
    url: "https://coinjecture-explorer-six.vercel.app/",
    siteName: "COINjecture",
    images: [
      {
        url: "/brand-logo.png",
        width: 512,
        height: 512,
        alt: "COINjecture Logo",
      },
    ],
    locale: "en_US",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider>
          <Layout>
            {children}
          </Layout>
        </QueryClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
