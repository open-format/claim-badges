"user server";

import { matchain } from "@/constants/chains";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const publicClient = createPublicClient({
  chain: matchain,
  transport: http(),
});

export const walletClient = createWalletClient({
  account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
  chain: matchain,
  transport: http(),
});
