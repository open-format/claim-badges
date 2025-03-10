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

export default function NewBadges({
  onClaimSuccess,
}: {
  onClaimSuccess: () => void;
}) {
  const { sortedBadges: badges, checkClaimStatus } = useBadgeContext();

  const communityBadges = badges.filter(
    (badge) => !process.env.NEXT_PUBLIC_MASTERCLASS_BADGE_IDS?.split(",").includes(badge.id || "")
  );

  if (!communityBadges || !communityBadges.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="text-muted-foreground/80 text-4xl">🏆</div>
        <h3 className="text-xl font-semibold">All Caught Up!</h3>
        <p className="text-muted-foreground max-w-sm">
          You've claimed all available badges for now. Check back soon for new opportunities to earn
          more rewards!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {communityBadges.map((badge) => (
        <Item
          key={badge.id}
          badge={badge}
          metadataURI={badge.metadataURI}
          claimStatus={checkClaimStatus(badge)}
          onClaimSuccess={onClaimSuccess}
        />
      ))}
    </div>
  );
}

function Item({
  badge,
  metadataURI,
  claimStatus,
  onClaimSuccess,
}: {
  badge: BadgeWithCollectedStatus;
  metadataURI: string;
  claimStatus: string;
  onClaimSuccess: () => void;
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
        await claimBadgeAction(badge);
        onClaimSuccess();
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

  return (
    <Card className="flex flex-col justify-between text-white" variant="outline">
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
            <Button className="w-full" onClick={handleClaim}>
              {isClaiming
                ? "Claiming..."
                : claimStatus === ClaimStatus.Claimable
                  ? "Claim"
                  : "Not Claimable"}
              {isClaiming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
