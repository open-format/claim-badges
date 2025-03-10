export const maxDuration = 60;

import { BadgeTabs } from "@/components/badge-tabs";

import CommunityProfile from "@/components/community-profile";
import { BadgeProvider } from "@/components/providers/badge-provider";
import Tiers from "@/components/tiers";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import LoginModalDialog from "@/dialogs/login-modal-dialog";
import { checkRewardStatus, fetchCommunity, fetchUserProfile } from "@/lib/openformat";
import { Trophy } from "lucide-react";
import Image from "next/image";

export default async function CommunityPage() {
  if (!process.env.NEXT_PUBLIC_COMMUNITY_ID) {
    return <div>Community ID not set</div>;
  }

  const community = await fetchCommunity(process.env.NEXT_PUBLIC_COMMUNITY_ID);
  const profile = await fetchUserProfile(process.env.NEXT_PUBLIC_COMMUNITY_ID);
  const cnyRewardStatus = await checkRewardStatus();

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
    <div className="sticky top-0 space-y-8">
      <BadgeProvider initialBadges={profile?.badges || community.badges}>
        {/* HERO */}
        <section
          className="relative bg-cover bg-center bg-no-repeat min-h-[500px] text-white p-4 md:p-12"
          style={{ backgroundImage: "url(/images/background.png)" }}
        >
          {/* Add black overlay */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Content wrapper to ensure it appears above the overlay */}
          <div className="relative z-10 space-y-6 max-w-screen-lg mx-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <div className="h-[100px]">
                <img
                  src="/images/matchain-logo-white.png"
                  alt="Matchain Logo"
                  className="w-full h-full"
                />
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-[#B87759]" />
                  <p>Level 1</p>
                </div>
                <CommunityProfile />
              </div>
            </div>
            <div className="md:grid md:grid-cols-3 items-center gap-8 justify-between space-y-4">
              {/* Text Content */}
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-4xl">
                    Fuel Your Passion.
                    <br /> Earn PSG Rewards.
                  </h1>
                  <p>
                    PSG is a community-driven platform that rewards users for their contributions to
                    the community.
                  </p>
                </div>
                {/* CTA */}
                <div className="flex gap-4">
                  <LoginModalDialog initialMode="signup">
                    <Button className="bg-matchain-gold">Become a member</Button>
                  </LoginModalDialog>
                </div>
              </div>
              {/* PROMO */}
              <div className="md:col-span-2">
                <Tiers />
              </div>
            </div>
          </div>
        </section>
        {/* PERKS */}
        <section className="bg-white text-black mx-auto max-w-screen-lg space-y-12 p-4">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="space-y-2">
                <h1 className="font-medium">Become a PSG Icon:</h1>
                <h1>The Limited Edition Gold Card NFT</h1>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl">Tickets, Merch, Experiences & More.</h2>
                <h2 className="text-2xl">Worth its Weight in Gold.</h2>
              </div>
            </div>
            <div>
              <Image
                src="/images/gold-card.jpg"
                alt="Gold Card"
                width={500}
                height={500}
                className="rounded-2xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {PERKS.map((perk, i) => (
              <PerksCard key={perk.image + i} description={perk.description} image={perk.image} />
            ))}
          </div>
        </section>
        {/* Your PSG Collectables */}
        <section id="rewards-section" className="bg-black text-white p-8 min-h-[500px]">
          <BadgeTabs cnyRewardStatus={cnyRewardStatus} />
        </section>
      </BadgeProvider>
    </div>
  );
}

// Perks Card
function PerksCard({ description, image }: { description: string; image: string }) {
  return (
    <div className="border rounded-lg p-4">
      <AspectRatio ratio={1 / 1} className="m-10">
        <Image src={image} alt="Campaign" fill className="object-cover" />
      </AspectRatio>
      <div>
        <p className="text-center">{description}</p>
      </div>
    </div>
  );
}

// Perks
const PERKS = [
  {
    description: "Tickets for matches, galas, exclusive",
    image: "/images/perks/tickets.svg",
  },
  {
    description: "Personalised video messages from the players",
    image: "/images/perks/tickets.svg",
  },
  {
    description: "Private tour of the stadium, meeting the team",
    image: "/images/perks/tickets.svg",
  },
  {
    description: "$5000 of merch from our Nike Air Jordan partnership",
    image: "/images/perks/tickets.svg",
  },
  {
    description: "Over 70 VIP experiences up to grabs",
    image: "/images/perks/tickets.svg",
  },
];
