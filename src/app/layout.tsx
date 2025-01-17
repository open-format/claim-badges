import { Toaster } from "@/components/ui/sonner";
import { fetchCommunity } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Open Format Rewards",
  description: "On-chain rewards for your community",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const community = await fetchCommunity(process.env.NEXT_PUBLIC_COMMUNITY_ID);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased`}>
        <Providers>
          <main
            className={cn(
              "md:px-24 h-full py-2 min-h-screen bg-background",
              community?.metadata?.dark_mode ? "dark" : "light"
            )}
          >
            {children}
          </main>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
