import { Toaster } from "@/components/ui/sonner";
import { fetchCommunity } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";

export async function generateMetadata(): Promise<Metadata> {
  const community = await fetchCommunity(process.env.NEXT_PUBLIC_COMMUNITY_ID as string);

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
    title: "Matchain x PSG - Global Fan Club",
    description: "Take action and join the Paris Saint-Germain club to win exclusive prizes!",
    openGraph: {
      title: "Matchain x PSG - Global Fan Club",
      description: "Take action and join the Paris Saint-Germain club to win exclusive prizes!",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Matchain x PSG - Global Fan Club",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Matchain x PSG - Global Fan Club",
      description: "Take action and join the Paris Saint-Germain club to win exclusive prizes!",
      images: [ogImageUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
      </head>
      <body>
        <Providers>
          <main className="font-sans">{children}</main>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
