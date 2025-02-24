"use server";

import { rewardFacetAbi } from "@/abis/RewardFacet";
import { type Chain, ChainName, getChain, getChainById } from "@/constants/chains";
import { CLAIM_CONDITIONS } from "@/constants/claim-conditions";
import config from "@/constants/config";
import { getCommunities, getCommunity } from "@/db/queries/communities";
import axios from "axios";
import { request } from "graphql-request";
import { Redis } from "ioredis";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import { type Address, erc721Abi, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getCurrentUser, getUserHandle } from "./privy";
import { publicClient, walletClient } from "./viem";

if (!process.env.KV_URL) {
  throw new Error("KV_URL is not set");
}

const redis = new Redis(process.env.KV_URL);

const apiClient = axios.create({
  baseURL: config.OPENFORMAT_API_URL,
  headers: {
    "x-api-key": config.OPENFORMAT_API_KEY,
  },
});

export async function revalidate() {
  revalidatePath("/");
}

export async function getChainFromCommunityOrCookie(
  communityIdOrSlug?: string,
  chain_id?: number
): Promise<Chain | null> {
  let chain: Chain | null = null;

  if (communityIdOrSlug) {
    const community = await getCommunity(communityIdOrSlug);
    if (community?.chain_id) {
      chain = getChainById(community.chain_id);
    }
  }

  if (!chain && chain_id) {
    chain = getChainById(chain_id);
  }

  if (!chain) {
    const cookieStore = await cookies();
    const chainName = cookieStore.get("chainName");
    chain = chainName ? getChain(chainName.value as ChainName) : getChain(ChainName.ARBITRUM_SEPOLIA);
  }

  return chain;
}

export async function fetchAllCommunities() {
  try {
    const chain = await getChainFromCommunityOrCookie();

    if (!chain) {
      console.log("No chain found for chainName:", chain);
      return { data: [], error: "No chain found." };
    }

    const user = await getCurrentUser();
    const dbCommunities = await getCommunities();

    if (!user) {
      return { data: [], error: "User not found." };
    }

    const query = `
    query ($owner: String!) {
      apps(
        where: {owner_contains_nocase: $owner}
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        name
        owner {
          id
        }
      }
    }
    `;
    try {
      const data = await request<{
        apps: { id: string; name: string; owner: { id: string } }[];
      }>(chain.SUBGRAPH_URL, query, {
        owner: user.wallet_address,
      });

      const matchedCommunities = data.apps.map((app) => ({
        ...app,
        metadata: dbCommunities.find((dbComm) => dbComm.id === app.id || dbComm.slug === app.id),
      }));

      return { data: matchedCommunities || [], error: null };
    } catch {
      return { data: [], error: "Failed to fetch onchain communities. Please try again." };
    }
  } catch {
    return { data: [], error: "Failed to fetch communities. Please try again later." };
  }
}

export const fetchCommunity = cache(async (slugOrId: string) => {
  const communityFromDb = await getCommunity(slugOrId);

  const chain = getChain(ChainName.MATCHAIN);

  if (!communityFromDb) {
    return null;
  }

  const query = `
query ($app: ID!) {
  app(id: $app) {
    id
    name
    owner {
      id
    }
    badges(orderBy: createdAt, orderDirection: asc) {
      id
      name
      metadataURI
      totalAwarded
    }
    tokens {
      id
      token {
        id
        tokenType
        name
        symbol
        createdAt
      }
    }
  }
}
  `;
  try {
    const data = await request<{
      app: {
        id: string;
        name: string;
        owner: { id: string };
        badges: { id: string }[];
        tokens: Token[];
      };
    }>(chain.SUBGRAPH_URL, query, { app: communityFromDb.id });

    const rewards = await fetchAllRewardsByCommunity(communityFromDb.id);

    return {
      ...data.app,
      rewards,
      metadata: communityFromDb,
    };
    // @TODO: Create a generic error handler for subgraph requests
  } catch (error) {
    console.error(error);
    return null;
  }
});

async function fetchAllRewardsByCommunity(communityId: string): Promise<Reward[] | null> {
  const chain = await getChainFromCommunityOrCookie();

  if (!chain) {
    return null;
  }

  // @TODO: Handle pagination
  const query = `
   query ($app: String!) {
  rewards(where: {app: $app}, orderBy: createdAt, orderDirection: desc, first: 10) {
    id
    transactionHash
    metadataURI
    rewardId
    rewardType
    token {
      id
      name
      symbol
    }
    tokenAmount
    badge {
      name
      metadataURI
    }
    badgeTokens {
      tokenId
    }
    user {
      id
    }
    createdAt
  }
}`;

  const data = await request<{
    rewards: Reward[];
  }>(chain.SUBGRAPH_URL, query, { app: communityId });

  return data.rewards;
}

export async function fetchUserProfile(slug: string) {
  const cookieStore = await cookies();
  const currentUserAddress = cookieStore.get("address");
  const community = await getCommunity(slug);
  const chain = getChain(ChainName.MATCHAIN);

  if (!currentUserAddress || !community || !chain) {
    return null;
  }

  const query = `
  query ($user: ID!, $community: String!) {
    user(id: $user) {
      tokenBalances(where: {token_: {app: $community}}) {
        balance
        token {
          id
          app {
            id
          }
        }
      }
      collectedBadges(where: {badge_: {app: $community}}, first: 1000) {
        badge {
          id
          metadataURI
          createdAt
        }
        tokenId
      }
    }
    rewards(
      where: {user: $user, app: $community}
      orderBy: createdAt
      orderDirection: desc
      first: 10
    ) {
      id
      transactionHash
      metadataURI
      rewardId
      rewardType
      token {
        id
        name
        symbol
      }
      tokenAmount
      badge {
        name
        metadataURI
      }
      badgeTokens {
        tokenId
      }
      createdAt
    }
    badges(where: {app: $community}) {
      id
      name
      metadataURI
      createdAt
    }
  }
  `;

  const data = await request<{
    user: UserProfile | null;
    rewards: Reward[];
    badges: Badge[];
  }>(chain.SUBGRAPH_URL, query, {
    user: currentUserAddress.value.toLowerCase(),
    community: community.id.toLowerCase(),
  });

  if (!data.user) {
    return { error: "User data not found." };
  }

  const userCollectedBadges = data.user.collectedBadges.reduce((acc, collected) => {
    acc.set(collected.badge.id, collected.tokenId);
    return acc;
  }, new Map<string, string>());

  const badgesWithCollectedStatus: BadgeWithCollectedStatus[] = data.badges
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((badge) => ({
      ...badge,
      isCollected: userCollectedBadges.has(badge.id),
      tokenId: userCollectedBadges.get(badge.id) || null,
    }));

  return {
    ...data.user,
    rewards: data.rewards,
    badges: badgesWithCollectedStatus,
  };
}

export async function generateLeaderboard(slugOrId: string): Promise<LeaderboardEntry[] | null> {
  const chain = await getChainFromCommunityOrCookie(slugOrId);

  if (!chain) {
    return null;
  }

  try {
    const communityFromDb = await getCommunity(slugOrId);

    if (!communityFromDb || !communityFromDb.token_to_display) {
      return null;
    }

    const params = new URLSearchParams();
    params.set("app_id", communityFromDb.id);
    params.set("token_id", communityFromDb.token_to_display);
    params.set("start", "0");
    params.set("end", "99999999999999999999999999");
    // @TODO: Make this dynamic
    params.set(
      "chain",
      chain.apiChainName === ChainName.AURORA
        ? "aurora"
        : chain.apiChainName === ChainName.TURBO
        ? "turbo"
        : chain.apiChainName === ChainName.BASE
        ? "base"
        : "arbitrum-sepolia"
    );
    const response = await apiClient.get(`/leaderboard?${params}`);

    // Fetch social handles for each user in the leaderboard
    const leaderboardWithHandles = await Promise.all(
      response.data.data.map(async (entry) => ({
        ...entry,
        handle: (await getUserHandle(entry.user as Address))?.username ?? "Anonymous",
        type: (await getUserHandle(entry.user as Address))?.type ?? "unknown",
      }))
    );

    return leaderboardWithHandles;
  } catch (error) {
    return { error: "Failed to fetch leaderboard data. Please try again later." };
  }
}

async function getNonce(address: string, retryCount = 0): Promise<number> {
  try {
    const currentNonce = await publicClient.getTransactionCount({ address: address as Address });
    console.log("Current nonce:", currentNonce);
    const redisKey = `nonce:${address}`;

    // Initialize nonce in Redis if it doesn't exist
    const exists = await redis.exists(redisKey);
    if (!exists) {
      await redis.set(redisKey, currentNonce.toString());
    }

    // Atomic increment and get
    const nextNonce = await redis.incr(redisKey);

    // If our nonce got too far ahead, reset it
    if (nextNonce > currentNonce + 10 || nextNonce < currentNonce) {
      await redis.set(redisKey, currentNonce.toString());
      return currentNonce;
    }

    return nextNonce - 1; // Return the pre-incremented value
  } catch (error) {
    if (retryCount >= 3) {
      throw new Error(`Failed to get nonce after ${retryCount} retries: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** retryCount));
    return getNonce(address, retryCount + 1);
  }
}

async function sendTransactionWithRetry(
  sendTransaction: (nonce: number) => Promise<void>,
  maxRetries = 5
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const address = walletClient.account.address;
      const nonce = await getNonce(address);

      await sendTransaction(nonce);
      return; // Success, exit the function
    } catch (error) {
      lastError = error;
      console.error(`Transaction attempt ${attempt + 1} failed:`, error);

      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  // If we've exhausted all retries
  throw new Error("Failed to claim badge. Please try again later.");
}

export async function claimBadge(badgeId: Address, badgeName: string, user: Address, ipfsHash: string) {
  try {
    const alreadyOwns = await publicClient.readContract({
      address: badgeId as Address,
      abi: erc721Abi,
      functionName: "balanceOf",
      args: [user],
    });

    if (alreadyOwns > BigInt(0)) {
      return { success: false, message: "Badge already claimed" };
    }

    // Fetch user's collected badges
    const userProfile = await fetchUserProfile(process.env.NEXT_PUBLIC_COMMUNITY_ID as string);
    const userBadges = userProfile?.badges || [];

    if (!userProfile || !userBadges) {
      return { success: false, message: "Badges not found." };
    }

    // Find the badge and its claim condition
    const condition = CLAIM_CONDITIONS.find((c) => c.badgeId === badgeId);

    if (!condition) {
      return { success: false, message: "Badge is not claimable due to missing conditions." };
    }

    const now = new Date();
    const ownsRequiredBadge = condition.mustOwnBadge
      ? userBadges.some((b) => b.id === condition.mustOwnBadge && b.isCollected)
      : true;

    const withinDateRange =
      condition.claimableFrom && condition.claimableTo
        ? condition.claimableFrom <= now && now <= condition.claimableTo
        : true;

    if (!ownsRequiredBadge) {
      return { success: false, message: "You must own the required badge before claiming this badge." };
    }

    if (!withinDateRange) {
      return { success: false, message: "This badge is not claimable at this time." };
    }

    // Proceed with claiming the badge
    await sendTransactionWithRetry(async (nonce) => {
      const { request } = await publicClient.simulateContract({
        account: privateKeyToAccount(process.env.PRIVATE_KEY as Address),
        address: process.env.NEXT_PUBLIC_COMMUNITY_ID as Address,
        abi: rewardFacetAbi,
        functionName: "mintBadge",
        args: [
          badgeId as Address,
          user as Address,
          stringToHex(`Claimed ${badgeName}`, { size: 32 }),
          stringToHex("MISSION", { size: 32 }),
          stringToHex(ipfsHash),
        ],
      });

      await walletClient.writeContract({
        ...request,
        nonce,
      });
    });

    // Repeat for points minting
    await sendTransactionWithRetry(async (nonce) => {
      const { request: pointsRequest } = await publicClient.simulateContract({
        account: privateKeyToAccount(process.env.PRIVATE_KEY as Address),
        address: process.env.NEXT_PUBLIC_COMMUNITY_ID as Address,
        abi: rewardFacetAbi,
        functionName: "mintERC20",
        args: [
          process.env.POINTS_TOKEN_ADDRESS as Address,
          user as Address,
          parseEther("100"),
          stringToHex("Earned PSG Points", { size: 32 }),
          stringToHex("MISSION", { size: 32 }),
          ipfsHash,
        ],
      });

      await walletClient.writeContract({
        ...pointsRequest,
        nonce,
      });
    });

    revalidate();

    return { success: true };
  } catch (error) {
    console.error({ error });
    throw error;
  }
}
