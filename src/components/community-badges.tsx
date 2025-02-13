"use client";

import { useBadgeContext } from "@/components/providers/badge-provider";
import { ClaimStatus } from "@/constants/claim-conditions";
import LoginModalDialog from "@/dialogs/login-modal-dialog";
import { useRevalidate } from "@/hooks/useRevalidate";
import { getMetadata } from "@/lib/thirdweb";
import { Hooks } from "@matchain/matchid-sdk-react";
import { HelpCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { startTransition, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import RefreshButton from "./refresh-button";
import { AspectRatio } from "./ui/aspect-ratio";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const { useUserInfo } = Hooks;

export default function CommunityBadges() {
  const { sortedBadges, checkClaimStatus } = useBadgeContext();

  if (!sortedBadges || !sortedBadges.length) {
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
        <CardDescription>Badges available to collect in this community.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {sortedBadges.map((badge) => (
          <Item key={badge.id} badge={badge} metadataURI={badge.metadataURI} claimStatus={checkClaimStatus(badge)} />
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
  const { claimBadgeAction } = useBadgeContext(); // Get claimBadgeAction from context
  const [metadata, setMetadata] = useState<{ [key: string]: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const { address } = useUserInfo();
  const [shouldRevalidate, setShouldRevalidate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useRevalidate(shouldRevalidate, 2000, 3);

  const handleClaim = () => {
    setIsClaiming(true);
    startTransition(async () => {
      try {
        // Call claimBadgeAction from context, passing the badge object
        await claimBadgeAction(badge);
      } finally {
        setIsClaiming(false);
        setShouldRevalidate(true);
      }
    });
  };

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
