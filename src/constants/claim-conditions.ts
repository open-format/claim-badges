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
};

export enum ClaimStatus {
  Claimable = "Claimable",
  Claimed = "Claimed",
  NotClaimable = "Not Claimable",
  NotClaimableReason = "Not Claimable: ",
}

/**
 * An array of claim conditions, each specifying the requirements for claiming a particular badge.
 *
 * @constant {ClaimCondition[]} CLAIM_CONDITIONS
 */
export const CLAIM_CONDITIONS: ClaimCondition[] = [
  {
    badgeId: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
  },
  {
    badgeId: "0x83930cf99c3292f2f4045cc0727fd43783c1ac02",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-01-22T00:00:00Z"),
    claimableTo: new Date("2025-01-22T23:59:59Z"),
  },
  {
    badgeId: "0x16b86b74291dc2e81f2012be803c24bef012474c",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-01-25T00:00:00Z"),
    claimableTo: new Date("2025-01-25T23:59:59Z"),
  },
  {
    badgeId: "0x5967e3626cb1a09816af0886ce584c72d717f5f8",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-01-29T00:00:00Z"),
    claimableTo: new Date("2025-01-29T23:59:59Z"),
  },
  {
    badgeId: "0x716ad1b6222046289c1664825cd9e4caf6253aec",
    mustOwnBadge: "0x3e9af5c6ae7f7936c629de669a0e3295f3266fb0",
    claimableFrom: new Date("2025-01-29T00:00:00Z"),
    claimableTo: new Date("2025-02-12T23:59:59Z"),
  }
];
