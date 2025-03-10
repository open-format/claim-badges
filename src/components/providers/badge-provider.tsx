"use client";

import { CLAIM_CONDITIONS, ClaimStatus } from "@/constants/claim-conditions";
import { useConfetti } from "@/contexts/confetti-context";
import { claimBadge as claimBadgeAPI, revalidate } from "@/lib/openformat"; // Keep your existing claimBadge import
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner"; // Import toast for error messages
import type { Address } from "viem";

type BadgeContextType = {
  badges: BadgeWithCollectedStatus[];
  setBadges: React.Dispatch<React.SetStateAction<BadgeWithCollectedStatus[]>>;
  sortedBadges: BadgeWithCollectedStatus[];
  claimedBadges: BadgeWithCollectedStatus[];
  checkClaimStatus: (badge: BadgeWithCollectedStatus) => string;
  claimBadgeAction: (badge: BadgeWithCollectedStatus, rewardId?: string) => Promise<void>; // Modified claimBadgeAction signature
};

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider: React.FC<{
  children: ReactNode;
  initialBadges: BadgeWithCollectedStatus[];
}> = ({ children, initialBadges }) => {
  const [badges, setBadges] = useState<BadgeWithCollectedStatus[]>(initialBadges);
  const address = Cookies.get("address");
  console.log({ address });
  const { triggerConfetti } = useConfetti();

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
    const condition = CLAIM_CONDITIONS.find(
      (c) => c.badgeId.toLowerCase().trim() === badge.id.toLowerCase().trim()
    );

    if (!condition) {
      // If no condition is found by badge has been collected, show Claimed
      // Otherwise, show Hidden
      return badge.isCollected ? ClaimStatus.Claimed : ClaimStatus.Hidden;
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
        ).format("HH:mm")} - ${dayjs(condition.claimableTo).format("HH:mm")} on ${dayjs(
          condition.claimableFrom
        ).format("D MMMM YYYY")}.`;
      }
      return `${ClaimStatus.NotClaimableReason}You can claim this badge between ${dayjs(
        condition.claimableFrom
      ).format("MMMM D, YYYY")} and ${dayjs(condition.claimableTo).format("MMMM D, YYYY")}.`;
    }

    return badge.isCollected ? ClaimStatus.Claimed : ClaimStatus.Claimable;
  };

  const sortedBadges = useMemo(() => {
    const filtered = badges.filter((badge) =>
      checkClaimStatus(badge).startsWith(ClaimStatus.Claimable)
    );
    const sorted = sortBadges(filtered);

    return sorted;
  }, [badges, address]);

  const claimedBadges = useMemo(() => {
    return badges.filter((badge) => checkClaimStatus(badge).startsWith(ClaimStatus.Claimed));
  }, [badges, address]);

  const claimBadgeAction = useCallback(
    async (badge: BadgeWithCollectedStatus, rewardId?: string) => {
      if (!address) {
        toast.error("Please login to claim badges."); // Added login check
        return;
      }

      setBadges((currentBadges) =>
        currentBadges.map((b) => (b.id === badge.id ? { ...b, isCollected: true } : b))
      );

      try {
        const result = await claimBadgeAPI(
          badge.id as Address,
          badge.name as string,
          address as Address,
          badge.metadataURI,
          rewardId
        );

        if (!result.success) {
          toast.info(result.message);
          return;
        }

        revalidate();
        toast.success("Badge claimed successfully!");
        triggerConfetti();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "An unknown error occurred");
        setBadges((currentBadges) =>
          currentBadges.map((b) => (b.id === badge.id ? { ...b, isCollected: false } : b))
        );
        throw error;
      }
    },
    [address, setBadges] // Dependencies for useCallback
  );

  return (
    <BadgeContext.Provider
      value={{
        badges,
        setBadges,
        sortedBadges,
        checkClaimStatus,
        claimedBadges,
        claimBadgeAction, // Expose claimBadgeAction
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
