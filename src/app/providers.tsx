"use client";

import config from "@/constants/config";
import { ConfettiProvider } from "@/contexts/confetti-context";
import { MatchProvider } from "@matchain/matchid-sdk-react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MatchProvider appid={config.MATCHID_APP_ID as string}>
      <ConfettiProvider>{children}</ConfettiProvider>
    </MatchProvider>
  );
}
