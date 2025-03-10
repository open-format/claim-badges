export const maxDuration = 60;

import { BadgeTabs } from "@/components/badge-tabs";

import Hero from "@/components/hero";
import { BadgeProvider } from "@/components/providers/badge-provider";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { checkRewardStatus, fetchCommunity, fetchUserProfile } from "@/lib/openformat";
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
        <Hero />
        {/* PERKS */}
        <section className="bg-white text-black mx-auto max-w-screen-lg space-y-12 p-4">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="font-medium">Become a PSG Icon:</h1>
                <h1>The Limited Edition Gold Card NFT</h1>
              </div>
              <div>
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
