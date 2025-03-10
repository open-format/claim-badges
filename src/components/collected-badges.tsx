"use client";

import { useBadgeContext } from "@/components/providers/badge-provider";
import { useRevalidate } from "@/hooks/useRevalidate";
import { getMetadata } from "@/lib/thirdweb";
import { Hooks } from "@matchain/matchid-sdk-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const { useUserInfo } = Hooks;

export default function CommunityBadges() {
  const { claimedBadges } = useBadgeContext();
  const { address } = useUserInfo();

  if (claimedBadges.length === 0) {
    return (
      <div className="flex flex-col px-4">
        <p className="text-muted-foreground">
          {address ? "No badges collected" : "Login or become a member to view badges"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {claimedBadges.map((badge) => (
        <Item key={badge.id} badge={badge} metadataURI={badge.metadataURI} />
      ))}
    </div>
  );
}

function Item({
  badge,
  metadataURI,
}: {
  badge: BadgeWithCollectedStatus;
  metadataURI: string;
}) {
  const [metadata, setMetadata] = useState<{ [key: string]: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const { address } = useUserInfo();
  const [shouldRevalidate, setShouldRevalidate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useRevalidate(shouldRevalidate, 2000, 3);

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
    <Card className="flex flex-col justify-between bg-transparent text-white" variant="borderless">
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
    </Card>
  );
}
