"use client";

import config from "@/constants/config";
import { ConfettiProvider } from "@/contexts/confetti-context";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { matchain } from "viem/chains";
import { http } from "wagmi";

const chainConfig = createConfig({
  chains: [matchain],
  transports: {
    [matchain.id]: http(),
  },
});
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={config.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "all-users",
        },
        // @TODO: Issue with embedded wallets on Aurora and turboChain - awaiting Privy support
        supportedChains: [matchain],
        defaultChain: matchain,

        appearance: {
          walletChainType: "ethereum-only",
          walletList: ["detected_wallets"],
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={chainConfig}>
          <ConfettiProvider>{children}</ConfettiProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
