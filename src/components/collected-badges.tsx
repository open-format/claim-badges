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
import { Button } from "./ui/button";
import LoginModalDialog from "@/dialogs/login-modal-dialog";

const { useUserInfo } = Hooks;

export default function CommunityBadges({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { claimedBadges } = useBadgeContext();
  const { address } = useUserInfo();

  if (claimedBadges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        {address ? (
          <>
            <div className="text-muted-foreground/80 text-4xl">✨</div>
            <h3 className="text-xl font-semibold">Start Your Collection!</h3>
            <p className="text-muted-foreground max-w-sm">
              Ready to begin your journey? Discover and claim your first badge to start building
              your collection.
            </p>
            <Button onClick={() => setActiveTab("badges")}>View Available Badges</Button>
          </>
        ) : (
          <>
            <div className="text-muted-foreground/80 text-4xl">🔒</div>
            <h3 className="text-xl font-semibold">Login to View Your Collection</h3>
            <p className="text-muted-foreground max-w-sm">
              Sign in to start collecting and tracking your PSG badges and rewards.
            </p>
            <div className="space-x-2">
              <LoginModalDialog initialMode="signup">
                <Button className="bg-matchain-gold">Become a member</Button>
              </LoginModalDialog>
              <LoginModalDialog>
                <Button>Login</Button>
              </LoginModalDialog>
            </div>
          </>
        )}
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
