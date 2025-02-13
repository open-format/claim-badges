"use client";

import { CLAIM_CONDITIONS, ClaimStatus } from "@/constants/claim-conditions";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

type BadgeContextType = {
  badges: BadgeWithCollectedStatus[];
  setBadges: React.Dispatch<React.SetStateAction<BadgeWithCollectedStatus[]>>;
  sortedBadges: BadgeWithCollectedStatus[];
  checkClaimStatus: (badge: BadgeWithCollectedStatus) => string;
  setAddress: React.Dispatch<React.SetStateAction<string | null>>;
};

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider: React.FC<{
  children: ReactNode;
  initialBadges: BadgeWithCollectedStatus[];
}> = ({ children, initialBadges }) => {
  const [badges, setBadges] = useState<BadgeWithCollectedStatus[]>(initialBadges);
  const address = Cookies.get("address");

  const sortBadges = (badgesToSort: BadgeWithCollectedStatus[]): BadgeWithCollectedStatus[] => {
    const BADGE_PRIORITY_ORDER = process.env.NEXT_PUBLIC_BADGE_ORDER?.split(",") || [];

    return [...badgesToSort].sort((a, b) => {
      const indexA = BADGE_PRIORITY_ORDER.indexOf(a.id);
      const indexB = BADGE_PRIORITY_ORDER.indexOf(b.id);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return (a.name || "").localeCompare(b.name || "");
    });
  };

  const checkClaimStatus = (badge: BadgeWithCollectedStatus) => {
    const condition = CLAIM_CONDITIONS.find((c) => c.badgeId === badge.id);

    // If no condition is found, log the badge details
    if (!condition) {
      console.warn(`No claim condition found for badge:`, {
        id: badge.id,
        name: badge.name,
        availableConditions: CLAIM_CONDITIONS.map((c) => c.badgeId),
      });

      // Fallback to claimable if no specific condition is found
      return badge.isCollected ? ClaimStatus.Claimed : ClaimStatus.Claimable;
    }

    const hide = condition.hide && !badge.isCollected;
    if (hide) return ClaimStatus.Hidden;

    const now = new Date();

    const ownsRequiredBadge = condition.mustOwnBadge
      ? badges?.some((b) => b.id === condition.mustOwnBadge && b.isCollected)
      : true;
    const withinDateRange =
      condition.claimableFrom && condition.claimableTo
        ? condition.claimableFrom <= now && now <= condition.claimableTo
        : true;

    if (!ownsRequiredBadge) {
      const requiredBadge = badges?.find((b) => b.id === condition.mustOwnBadge);
      return `${ClaimStatus.NotClaimableReason}You must own ${
        requiredBadge?.name || "the required badge"
      } before claiming this badge.`;
    }
    if (!withinDateRange) {
      if (dayjs(condition.claimableFrom).isSame(condition.claimableTo, "day")) {
        return `${ClaimStatus.NotClaimableReason}You can claim this badge between ${dayjs(
          condition.claimableFrom
        ).format("HH:mm")} - ${dayjs(condition.claimableTo).format("HH:mm")} on ${dayjs(condition.claimableFrom).format(
          "D MMMM YYYY"
        )}.`;
      }
      return `${ClaimStatus.NotClaimableReason}You can claim this badge between ${dayjs(condition.claimableFrom).format(
        "MMMM D, YYYY"
      )} and ${dayjs(condition.claimableTo).format("MMMM D, YYYY")}.`;
    }

    return badge.isCollected ? ClaimStatus.Claimed : ClaimStatus.Claimable;
  };

  const sortedBadges = useMemo(() => {
    const filtered = badges.filter((badge) => !checkClaimStatus(badge).startsWith(ClaimStatus.Hidden));
    const sorted = sortBadges(filtered);

    return sorted;
  }, [badges, address]);

  return (
    <BadgeContext.Provider
      value={{
        badges,
        setBadges,
        sortedBadges,
        checkClaimStatus,
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error("useBadgeContext must be used within a BadgeProvider");
  }
  return context;
};
