"use client";

import { ChainName } from "@/constants/chains";
import { revalidate } from "@/lib/openformat";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import Cookies from "js-cookie";
import { startTransition, useEffect } from "react";
import { matchain } from "viem/chains";
import { useAccount, useSwitchChain } from "wagmi";
import LinkAccounts from "./link-accounts";
import Profile from "./profile-header";
export default function CommunityProfile() {
  const { logout } = usePrivy();
  const account = useAccount();
  const { switchChain } = useSwitchChain();
  useLogin({
    onComplete: ({ wasAlreadyAuthenticated }) => {
      if (!wasAlreadyAuthenticated) {
        startTransition(() => {
          revalidate();
        });
      }
    },
  });

  useLogout({
    onSuccess: () => {
      startTransition(() => {
        revalidate();
      });
    },
  });

  useEffect(() => {
    if (account.chainId !== matchain.id) {
      switchChain({ chainId: matchain.id });
      Cookies.set("chainName", ChainName.MATCHAIN);
    }
  }, [account]);

  return (
    <div className="flex flex-col-reverse items-center gap-4 md:flex-row md:items-center md:justify-between">
      <LinkAccounts />
      <Profile logoutAction={logout} />
    </div>
  );
}
