"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

type BadgeContextType = {
  badges: BadgeWithCollectedStatus[];
  setBadges: React.Dispatch<React.SetStateAction<BadgeWithCollectedStatus[]>>;
};

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider: React.FC<{
  children: ReactNode;
  initialBadges: BadgeWithCollectedStatus[];
}> = ({ children, initialBadges }) => {
  const [badges, setBadges] = useState<BadgeWithCollectedStatus[]>(initialBadges);

  return <BadgeContext.Provider value={{ badges, setBadges }}>{children}</BadgeContext.Provider>;
};

export const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error("useBadgeContext must be used within a BadgeProvider");
  }
  return context;
};
