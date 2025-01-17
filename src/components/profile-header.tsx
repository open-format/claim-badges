"use client";

import { Avatar } from "@/components/ui/avatar";
import LoginModalDialog from "@/dialogs/login-modal-dialog";
import { addressSplitter } from "@/lib/utils";
import { Hooks } from "@matchain/matchid-sdk-react";
import Cookies from "js-cookie";
import { CopyIcon, LogOut } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
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

  function handleLogout() {
    logout();
    Cookies.remove("address");
  }

  useEffect(() => {
    if (address) {
      Cookies.set("address", address);
    } else {
      Cookies.remove("address");
    }
  }, [address]);

  function copyAddress() {
    navigator.clipboard.writeText(address || "");
    toast.success("Address copied to clipboard");
  }

  return address ? (
    <DropdownMenu>
      <DropdownMenuTrigger>{address && <Avatar seed={address} />}</DropdownMenuTrigger>
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
      <Button>Login</Button>
    </LoginModalDialog>
  );
}
