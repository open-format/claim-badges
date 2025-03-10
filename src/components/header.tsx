"use client";

import { Trophy } from "lucide-react";
import { Hooks } from "@matchain/matchid-sdk-react";
import CommunityProfile from "./community-profile";

export default function Header() {
  const { useUserInfo } = Hooks;
  const { address } = useUserInfo();
  return (
    <div className="flex justify-between items-center">
      <div className="h-[50px]">
        <img src="/images/matchain-logo-white.png" alt="Matchain Logo" className="w-full h-full" />
      </div>
      <div className="flex items-center space-x-6">
        {address && (
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#B87759]" />
            <p>Level 1</p>
          </div>
        )}
        <CommunityProfile />
      </div>
    </div>
  );
}
