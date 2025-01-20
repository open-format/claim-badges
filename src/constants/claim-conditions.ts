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
    badgeId: "0x3E9af5C6AE7f7936C629dE669A0e3295F3266FB0",
  },
  {
    badgeId: "0x83930cF99c3292f2f4045Cc0727FD43783c1aC02",
    mustOwnBadge: "0x3E9af5C6AE7f7936C629dE669A0e3295F3266FB0",
    claimableFrom: new Date("2025-01-22T00:00:00Z"),
    claimableTo: new Date("2025-01-22T23:59:59Z"),
  },
];
