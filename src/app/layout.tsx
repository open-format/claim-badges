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

export async function generateMetadata(): Promise<Metadata> {
  const community = await fetchCommunity(process.env.NEXT_PUBLIC_COMMUNITY_ID);

  // Use VERCEL_URL in production, fallback to localhost in development
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Generate the OG image URL
  const ogImageUrl =
    community?.metadata?.banner_url ||
    `${baseUrl}/api/og?title=${encodeURIComponent(
      community?.metadata?.title || "Community"
    )}&accent=${encodeURIComponent(community?.metadata?.accent_color || "#6366F1")}`;

  return {
    title: community?.metadata?.title ?? "Community",
    description: community?.metadata?.description ?? "Welcome to our community",
    openGraph: {
      title: community?.metadata?.title ?? "Community",
      description: community?.metadata?.description ?? "Welcome to our community",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: community?.metadata?.title ?? "Community",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: community?.metadata?.title ?? "Community",
      description: community?.metadata?.description ?? "Welcome to our community",
      images: [ogImageUrl],
    },
  };
}

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
