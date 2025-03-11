type CampaignReward = {
  id: number;
  name: string;
  description: {
    authenticated: string;
    unauthenticated: string;
    notWon: string;
  };
  image: string;
};

export const REWARDS: CampaignReward[] = [
  {
    id: 1,
    name: "CNY Winner!",
    description: {
      authenticated:
        "🎉 Congratulations! You've won an exclusive prize for collecting the CNY badge. You're one of our special collectors!",
      unauthenticated:
        "Login to discover if you've won an exclusive prize for collecting the CNY badge!",
      notWon: "Keep collecting badges! More exciting rewards are coming soon.",
    },
    image: "/images/cny-reward.svg",
  },
];
