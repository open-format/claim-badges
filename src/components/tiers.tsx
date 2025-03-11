"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

export default function Tiers() {
  // Hardcoded values
  const progress = 10; // Progress percentage

  const tiers = [
    {
      level: 1,
      color: "#B87759", // Bronze
    },
    {
      level: 2,
      color: "#A3A3A3", // Silver
    },
    {
      level: 3,
      color: "#D4AF37", // Gold
    },
  ];

  return (
    <Card
      className="bg-[#1a1a1a] text-white p-6 rounded-3xl relative overflow-hidden"
      variant="borderless"
    >
      {/* Coming Soon Banner */}
      <div className="absolute -right-14 top-8 rotate-45 bg-primary text-white px-12 py-1 text-sm font-semibold shadow-lg">
        Coming Soon
      </div>

      <CardContent className="space-y-6 opacity-80">
        <h2 className="font-bold">PSG Elite Fan Levels</h2>

        {/* Current and Next Level Display */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <p>Current level</p>
            <div className="px-4 rounded-full" style={{ backgroundColor: tiers[0].color }}>
              Level 1
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <p>Next level</p>
            <div className="px-4 rounded-full" style={{ backgroundColor: tiers[1].color }}>
              Level 2
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-1 bg-white rounded-full">
          <Progress value={progress} className="h-5 rounded-full bg-white" />
        </div>

        {/* Tiers Display */}
        <div className="grid grid-cols-3 gap-8 text-center">
          {tiers.map((tier) => (
            <div key={tier.level}>
              <Trophy className="mx-auto w-12 h-12" style={{ color: tier.color }} />
              <p style={{ color: tier.color }}>Level {tier.level}</p>
              <p className="text-xs text-white/80">{tier.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
