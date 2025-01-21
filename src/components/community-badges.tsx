"use client";

import { CLAIM_CONDITIONS, ClaimStatus } from "@/constants/claim-conditions";
import { useConfetti } from "@/contexts/confetti-context";
import LoginModalDialog from "@/dialogs/login-modal-dialog";
import { useRevalidate } from "@/hooks/useRevalidate";
import { claimBadge } from "@/lib/openformat";
import { getMetadata } from "@/lib/thirdweb";
import { Hooks } from "@matchain/matchid-sdk-react";
import dayjs from "dayjs";
import { HelpCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { startTransition, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { toast } from "sonner";
import type { Address } from "viem";
import RefreshButton from "./refresh-button";
import { AspectRatio } from "./ui/aspect-ratio";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const { useUserInfo } = Hooks;

const HARDCODED_METADATA_URIS = [
  "https://uqjehhscpszypwnzrbcx.supabase.co/storage/v1/object/public/matchain/badge1.json",
  "https://uqjehhscpszypwnzrbcx.supabase.co/storage/v1/object/public/matchain/badge2.json",
];

export default function ProfileBadgeGrid({ badges }: { badges: BadgeWithCollectedStatus[] | undefined }) {
  const checkClaimStatus = (badge: BadgeWithCollectedStatus) => {
    const condition = CLAIM_CONDITIONS.find((c) => c.badgeId === badge.id);
    if (!condition) return ClaimStatus.Claimable;

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

  if (!badges || !badges.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">This community has no badges yet</p>
      </div>
    );
  }
  return (
    <Card variant="borderless">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <h1>Badges</h1>
          <RefreshButton />
        </CardTitle>
        <CardDescription>Badges available to collect in this community</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {badges.map((badge, index) => (
          <Item
            key={badge.id}
            badge={badge}
            metadataURI={HARDCODED_METADATA_URIS[index]}
            claimStatus={checkClaimStatus(badge)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function Item({
  badge,
  metadataURI,
  claimStatus,
}: {
  badge: BadgeWithCollectedStatus;
  metadataURI: string;
  claimStatus: string;
}) {
  const [metadata, setMetadata] = useState<{ [key: string]: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const { address } = useUserInfo();
  const { triggerConfetti } = useConfetti();
  const [shouldRevalidate, setShouldRevalidate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { hasComplete } = useRevalidate(shouldRevalidate, 2000, 3);

  useEffect(() => {
    if (hasComplete) {
      setIsClaiming(false);
      triggerConfetti();
      toast.success("Badge claimed successfully!");
    }
  }, [hasComplete]);

  function handleClaim() {
    setIsClaiming(true);
    startTransition(async () => {
      try {
        const response = await claimBadge(
          badge.id as Address,
          metadata?.name as string,
          address as Address,
          metadataURI
        );

        if (!response.success) {
          throw new Error(response.error || "An unknown error occurred while claiming the badge.");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        toast.error(errorMessage);
      } finally {
        setShouldRevalidate(true);
      }
    });
  }

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await getMetadata(metadataURI);
        setMetadata(response);
        setImage(response.image);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    }

    fetchMetadata();
  }, [metadataURI]);

  const renderTooltipOrPopover = (children: React.ReactNode) => {
    if (isMobile) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div>{children}</div>
          </PopoverTrigger>
          {claimStatus.startsWith(ClaimStatus.NotClaimableReason) && (
            <PopoverContent className="text-xs" side="top">
              {claimStatus.replace(ClaimStatus.NotClaimableReason, "")}
            </PopoverContent>
          )}
        </Popover>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{children}</div>
          </TooltipTrigger>
          {claimStatus.startsWith(ClaimStatus.NotClaimableReason) && (
            <TooltipContent side="top" className="text-xs">
              {claimStatus.replace(ClaimStatus.NotClaimableReason, "")}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="flex flex-col justify-between">
      <CardContent className="flex items-center justify-center p-4">
        <AspectRatio ratio={1 / 1}>
          {isLoading && <Skeleton className="rounded-xl h-full w-full" />}
          {image && (
            <Image
              src={image}
              alt={metadata?.name || ""}
              fill
              className="rounded-xl object-cover"
              onLoad={() => setIsLoading(false)}
            />
          )}
        </AspectRatio>
      </CardContent>
      <CardHeader className="space-y-2">
        <CardTitle>{metadata?.name}</CardTitle>
        <CardDescription className="space-y-2">
          <p>{metadata?.description}</p>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        {!address ? (
          <LoginModalDialog>
            <Button className="w-full">Login to Claim</Button>
          </LoginModalDialog>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {renderTooltipOrPopover(
              <Button
                className="w-full"
                onClick={handleClaim}
                disabled={isClaiming || badge.isCollected || claimStatus !== ClaimStatus.Claimable}
              >
                {badge.isCollected
                  ? "Claimed"
                  : isClaiming
                  ? "Claiming..."
                  : claimStatus === ClaimStatus.Claimable
                  ? "Claim"
                  : "Not Claimable"}
                {isClaiming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {claimStatus.startsWith(ClaimStatus.NotClaimableReason) && <HelpCircle className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
