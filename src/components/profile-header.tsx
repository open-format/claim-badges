"use client";

import { Avatar } from "@/components/ui/avatar";
import { ChainName } from "@/constants/chains";
import LoginModalDialog from "@/dialogs/login-modal-dialog";
import { fetchCommunity } from "@/lib/openformat";
import { addressSplitter } from "@/lib/utils";
import { Hooks } from "@matchain/matchid-sdk-react";
import Cookies from "js-cookie";
import { CopyIcon, LogOut, PersonStandingIcon, UserIcon } from "lucide-react";
import { startTransition, useEffect } from "react";
import { toast } from "sonner";
import { useBadgeContext } from "./providers/badge-provider";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const { useUserInfo } = Hooks;

export default function Profile() {
  const { address, logout } = useUserInfo();
  const { setBadges } = useBadgeContext();
  function handleLogout() {
    logout();
    Cookies.remove("address");
    window.dispatchEvent(new Event("addressCookieChanged"));
    startTransition(async () => {
      const community = await fetchCommunity(process.env.NEXT_PUBLIC_COMMUNITY_ID as string);
      if (community) {
        if (community?.badges) {
          setBadges(community.badges);
        }
      }
    });
  }

  useEffect(() => {
    if (address) {
      Cookies.set("address", address);
      Cookies.set("chainName", ChainName.MATCHAIN);
      window.dispatchEvent(new Event("addressCookieChanged"));
    } else {
      Cookies.remove("address");
      window.dispatchEvent(new Event("addressCookieChanged"));
    }
  }, [address]);

  function copyAddress() {
    navigator.clipboard.writeText(address || "");
    toast.success("Address copied to clipboard");
  }

  return address ? (
    <DropdownMenu>
      <DropdownMenuTrigger>{address && <UserIcon />}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={copyAddress} className="font-bold">
          <span>{addressSplitter(address || "")}</span>
          <CopyIcon className="ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="font-bold">
          <span>Logout</span>
          <LogOut className="ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <LoginModalDialog>
      <Button variant="ghost">login</Button>
    </LoginModalDialog>
  );
}
