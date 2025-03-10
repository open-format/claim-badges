"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CollectedBadges from "./collected-badges";
import NewBadges from "./new-badges";
import Rewards from "./your-rewards";
import { useState } from "react";

export function BadgeTabs({ cnyRewardStatus }: { cnyRewardStatus: boolean }) {
  const [activeTab, setActiveTab] = useState("badges");

  return (
    <div className="max-w-screen-lg mx-auto space-y-8">
      <h1>Your PSG Collectables</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full space-x-4" variant="outline">
          <TabsTrigger value="badges" variant="outline">
            New to claim
          </TabsTrigger>
          <TabsTrigger value="collected" variant="outline">
            Your Collection
          </TabsTrigger>
          <TabsTrigger value="rewards" variant="outline">
            Your Rewards
          </TabsTrigger>
        </TabsList>
        <TabsContent value="badges">
          <NewBadges onClaimSuccess={() => setActiveTab("collected")} />
        </TabsContent>
        <TabsContent value="collected">
          <CollectedBadges />
        </TabsContent>
        <TabsContent value="rewards">
          <Rewards cnyRewardStatus={cnyRewardStatus} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
