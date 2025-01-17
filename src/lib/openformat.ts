"use server";

import { rewardFacetAbi } from "@/abis/RewardFacet";
import { type Chain, ChainName, getChain, getChainById } from "@/constants/chains";
import config from "@/constants/config";
import { getCommunities, getCommunity } from "@/db/queries/communities";
import axios from "axios";
import { request } from "graphql-request";
import { Redis } from "ioredis";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import { type Address, parseEther, stringToHex } from "viem";
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
  const currentUser = await getCurrentUser();
  const community = await getCommunity(slug);
  const chain = await getChainFromCommunityOrCookie();

  if (!currentUser || !community || !chain) {
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
    user: currentUser.wallet_address.toLowerCase(),
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

export async function fundAccount() {
  const currentUser = await getCurrentUser();
  // @TODO: Handle multiple chains, check wallet balance, etc.
  if (!config.ACCOUNT_BALANCE_SERVICE_URL || !config.ACCOUNT_BALANCE_SERVICE_AUTH_TOKEN) {
    return null;
  }

  const data = {
    user_address: currentUser?.wallet_address,
    amount: config.ACCOUNT_BALANCE_AMOUNT,
  };

  try {
    const response = await axios.post(`${config.ACCOUNT_BALANCE_SERVICE_URL}`, data, {
      headers: {
        Authorization: `Bearer ${config.ACCOUNT_BALANCE_SERVICE_AUTH_TOKEN}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getNonce(address: string, retryCount = 0): Promise<number> {
  // @DEV: fetches the latest nonce and increments it atomically
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
    if (nextNonce > currentNonce + 10) {
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

export async function claimBadge(badgeId: Address, badgeName: string, user: Address, ipfsHash: string) {
  // @TODO: Check if user already owns the badge
  // @TODO: Correct error handling
  // @TODO: Redis queue for the nonce
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

  const nonce = await getNonce(walletClient.account.address);

  await walletClient.writeContract({
    ...request,
    nonce,
  });

  const { request: pointsRequest } = await publicClient.simulateContract({
    account: privateKeyToAccount(process.env.PRIVATE_KEY as Address),
    address: process.env.NEXT_PUBLIC_COMMUNITY_ID as Address,
    abi: rewardFacetAbi,
    functionName: "mintERC20",
    args: [
      process.env.POINTS_TOKEN_ADDRESS as Address,
      user as Address,
      // @TODO: Work out amounts
      parseEther("100"),
      stringToHex("Earned PSG Points", { size: 32 }),
      stringToHex("MISSION", { size: 32 }),
      ipfsHash,
    ],
  });

  const pointsNonce = await getNonce(walletClient.account.address);

  await walletClient.writeContract({
    ...pointsRequest,
    nonce: pointsNonce,
  });

  revalidate();

  return true;
}
