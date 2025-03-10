type CampaignReward = {
	id: number;
	name: string;
	description: {
		authenticated: string;
		unauthenticated: string;
	};
	image: string;
};

export const REWARDS: CampaignReward[] = [
	{
		id: 1,
		name: "CNY Winner!",
		description: {
			authenticated:
				"You won a prize for being the first to collect 100 badges in the community.",
			unauthenticated:
				"Win a prize by being the first to collect 100 badges in the community.",
		},
		image: "/images/cny-reward.svg",
	},
];
