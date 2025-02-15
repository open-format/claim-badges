/**
 * Represents a condition under which a badge can be claimed
 *
 * @typedef {Object} ClaimCondition
 * @property {string} badgeId - The unique identifier of the badge that can be claimed.
 * @property {string} [mustOwnBadge] - (Optional) The unique identifier of a badge that must be owned before the current badge can be claimed.
 * @property {Date} [claimableFrom] - (Optional) The date and time from which the badge can be claimed.
 * @property {Date} [claimableTo] - (Optional) The date and time until which the badge can be claimed.
 */
type ClaimCondition = {
  badgeId: string;
  mustOwnBadge?: string;
  claimableFrom?: Date;
  claimableTo?: Date;
  hide?: boolean;
};

export enum ClaimStatus {
  Claimable = "Claimable",
  Claimed = "Claimed",
  NotClaimable = "Not Claimable",
  NotClaimableReason = "Not Claimable: ",
  Hidden = "Hidden",
}

/**
 * An array of claim conditions, each specifying the requirements for claiming a particular badge.
 *
 * @constant {ClaimCondition[]} CLAIM_CONDITIONS
 */
export const CLAIM_CONDITIONS: ClaimCondition[] = [
  {
    badgeId: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    hide: false,
  },
  {
    badgeId: "0x83930cf99c3292f2f4045cc0727fd43783c1ac02",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-01-22T00:00:00Z"),
    claimableTo: new Date("2025-01-22T23:59:59Z"),
    hide: true,
  },
  {
    badgeId: "0x16b86b74291dc2e81f2012be803c24bef012474c",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-01-25T00:00:00Z"),
    claimableTo: new Date("2025-01-25T23:59:59Z"),
    hide: true,
  },
  {
    badgeId: "0x5967e3626cb1a09816af0886ce584c72d717f5f8",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-01-29T00:00:00Z"),
    claimableTo: new Date("2025-01-29T23:59:59Z"),
    hide: true,
  },
  {
    badgeId: "0x716ad1b6222046289c1664825cd9e4caf6253aec",
    // mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-01-29T00:00:00Z"),
    claimableTo: new Date("2025-02-15T23:59:59Z"),
    hide: false,
  },
  {
    badgeId: "0x19a1e12bd12f2aa6a282d80118f2dcfe2288fd6b",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-02-01T00:00:00Z"),
    claimableTo: new Date("2025-02-01T23:59:59Z"),
    hide: true,
  },
  {
    badgeId: "0xc7529593f368393bd67d9a8671519716c36426f0",
    // mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-02-04T00:00:00Z"),
    claimableTo: new Date("2025-02-04T23:59:59Z"),
    hide: true,
  },
  {
    badgeId: "0xfa19bb26a14ae467d586bc93d46fb76ba76c7a8f",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-02-03T00:00:00Z"),
    claimableTo: new Date("2025-02-03T23:59:59Z"),
    hide: true,
  },
  {
    badgeId: "0xe6b24f681911e3f174c131c3d9b36319e146af24",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-02-05T00:00:00Z"),
    claimableTo: new Date("2025-02-07T23:59:59Z"),
    hide: true,
  },
  {
    badgeId: "0x355aa76bc7d671def8f08db13aeb74365bf5e8d4",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-02-11T00:00:00Z"),
    claimableTo: new Date("2025-02-11T23:59:59Z"),
    hide: true,
  },
  {
    badgeId: "0xd5239bf053e5eef35a67c80c4c4c0b20b8a0cde6",
    // mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-02-12T00:00:00Z"),
    claimableTo: new Date("2025-02-14T23:59:59Z"),
    hide: true,
  },
  {
    badgeId: "0xe1bbbb6dd3bd2ba35656d8546c6f504aa972ee52",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-02-15T00:00:00Z"),
    claimableTo: new Date("2025-02-15T23:59:59Z"),
    hide: false,
  }
];
