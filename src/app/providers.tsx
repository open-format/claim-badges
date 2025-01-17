"use client";

import config from "@/constants/config";
import { ConfettiProvider } from "@/contexts/confetti-context";
import dynamic from "next/dynamic";

// Dynamically import MatchProvider to ensure it's only loaded on the client side
const MatchProvider = dynamic(() => import("@matchain/matchid-sdk-react").then((mod) => mod.MatchProvider), {
  ssr: false,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MatchProvider appid={config.MATCHID_APP_ID as string}>
      <ConfettiProvider>{children}</ConfettiProvider>
    </MatchProvider>
  );
}
