import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "ipfs.io",
      "placehold.co",
      "857c4f158967b95f96003045fdb8c641.ipfscdn.io",
      "dxxqtmovifaszidnktqp.supabase.co",
    ],
  },
  typescript: {
    //@DEV Don't be lazy. Fix the types pal
    ignoreBuildErrors: true,
  },
  eslint: {
    //@DEV Don't be lazy. sort your linting pal
    ignoreDuringBuilds: true,
  },
  serverActions: {
    allowedOrigins: ['psgclubrewards.matchain.io', 'matchain.openformat.tech', 'matchain-badge-claiming.vercel.app'],
  },
};

export default nextConfig;
