"use client";

import LoginModalDialog from "@/dialogs/login-modal-dialog";
import Header from "./header";
import { Button } from "./ui/button";
import Tiers from "./tiers";
import { Hooks } from "@matchain/matchid-sdk-react";

export default function Hero() {
  const { useUserInfo } = Hooks;
  const { address } = useUserInfo();
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat min-h-[600px] text-white space-y-6 p-4 md:p-12
            bg-[url('/images/background-mobile.png')] 
            md:bg-[url('/images/background-desktop.png')]"
    >
      {/* Add black overlay */}
      <div className="absolute inset-0 bg-black/50" />
      {/* Content wrapper to ensure it appears above the overlay */}
      <div className="relative z-10 space-y-6 max-w-screen-lg mx-auto">
        {/* HEADER */}
        <Header />
        <div className="md:grid md:grid-cols-3 items-center gap-8 justify-between space-y-4">
          {/* Text Content */}
          <div className="flex-1 space-y-12 md:space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-4xl">
                Fuel Your Passion.
                <br /> Earn PSG Rewards.
              </h1>
              <h2>
                PSG is a community-driven platform that rewards users for their contributions to the
                community.
              </h2>
            </div>
            {/* CTA */}
            {!address && (
              <div className="flex gap-4">
                <LoginModalDialog initialMode="signup">
                  <Button size="lg" className="bg-matchain-gold">
                    Become a member
                  </Button>
                </LoginModalDialog>
              </div>
            )}
          </div>
          {/* PROMO */}
          <div className="md:col-span-2">
            <Tiers />
          </div>
        </div>
      </div>
    </section>
  );
}
