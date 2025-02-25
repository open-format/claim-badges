export const maxDuration = 60;

import { CommunityBanner } from "@/components/community-banner";
import CommunityInfo from "@/components/community-info";
import CommunityProfile from "@/components/community-profile";
import MasterclassBadges from "@/components/masterclass-badges";
import { BadgeProvider } from "@/components/providers/badge-provider";
import { fetchCommunity, fetchUserProfile } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import matchainImage from "../../../public/images/matchain.png";

export default async function CommunityPage() {
  if (!process.env.NEXT_PUBLIC_COMMUNITY_ID) {
    return <div>Community ID not set</div>;
  }

  const community = await fetchCommunity(process.env.NEXT_PUBLIC_COMMUNITY_ID);
  const profile = await fetchUserProfile(process.env.NEXT_PUBLIC_COMMUNITY_ID);

  if (!community) {
    return (
      <div className="text-center min-h-[100vh] flex flex-col items-center justify-center p-12 rounded-lg bg-background text-foreground space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold">
          Page Not Found <span className="inline-block animate-look-around">👀</span>
        </h2>
        <p className="text-xl max-w-2xl">
          We looked, but couldn&apos;t find a page at this URL. Please check the URL and try again.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-prose mx-auto space-y-4 p-5 rounded-xl bg-background sticky top-0 ",
        community?.metadata?.dark_mode ? "dark" : "light"
      )}
    >
      <BadgeProvider initialBadges={profile?.badges || community.badges}>
        {/* Community Profile */}
        <CommunityProfile />

        {/* Community Banner */}
        <CommunityBanner banner_url={matchainImage} accent_color={community.metadata.accent_color} />

        {/* Community Info */}
        <CommunityInfo
          title="Matchain Masterclasses"
          description="Prove attendance to Matchain masterclasses with on-chain badges"
        />
        <MasterclassBadges />
      </BadgeProvider>
    </div>
  );
}
