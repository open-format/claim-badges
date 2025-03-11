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
    <div className="sticky top-0 space-y-12 md:space-y-32">
      <BadgeProvider initialBadges={profile?.badges || community.badges}>
        {/* HERO */}
        <Hero />
        {/* PERKS */}
        <section className="bg-white mx-auto max-w-screen-lg space-y-12 p-4 md:p-0 text-primary">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            <div className="space-y-6 md:col-span-2">
              <div>
                <h2>Exclusive PSG Gold Card: Coming Soon</h2>
                <h2>Join the elite and win exclusive experiences.</h2>
              </div>
              <h3>
                Each Gold Card unlocks a Mystery box with Exclusive Air Jordans x PSG merchandise, a
                limited edition NFT, and one of many experiences that could include:
              </h3>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/gold-card.jpg"
                alt="Gold Card"
                width={350}
                height={350}
                className="rounded-2xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ">
            {PERKS.map((perk, i) => (
              <PerksCard key={perk.image + i} description={perk.description} image={perk.image} />
            ))}
          </div>
        </section>
        {/* Your PSG Collectables */}
        <section id="rewards-section" className="bg-black text-white p-8 md:p-24 min-h-[500px]">
          <BadgeTabs cnyRewardStatus={cnyRewardStatus} />
        </section>
      </BadgeProvider>
    </div>
  );
}

// Perks Card
function PerksCard({ description, image }: { description: string; image: string }) {
  return (
    <div className="border rounded-lg text-primary">
      <AspectRatio ratio={2 / 1}>
        <Image src={image} alt="Campaign" fill className="object-contain rounded-t-lg bg-primary" />
      </AspectRatio>
      <div>
        <p className="text-center font-medium p-4">{description}</p>
      </div>
    </div>
  );
}

// Perks
const PERKS = [
  {
    description: "Tickets for Matches, Galas, Exclusive Experiences",
    image: "/images/perks/free-tickets.png",
  },
  {
    description: "Private Tour Of The Stadium, Meet The Team",
    image: "/images/perks/stadium-tour.png",
  },
  {
    description: "Personalised Video Messages From The Players",
    image: "/images/perks/video-from-the-team.png",
  },
  {
    description: "$5000 of Merch from our Nike Air Jordan Partnership",
    image: "/images/perks/air-jordan.png",
  },
  {
    description: "Over 70 VIP Experiences Up To Grabs",
    image: "/images/perks/vip.png",
  },
];
