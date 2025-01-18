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
    badgeId: "0xde9b7c0c1709b612c3fbb4ba9ee380e4e7c12a01",
  },
  {
    badgeId: "0x12910c45293a224e8cbb9b5dc7927b28c7429091",
    mustOwnBadge: "0xde9b7c0c1709b612c3fbb4ba9ee380e4e7c12a01",
    claimableFrom: new Date("2025-01-22T00:00:00Z"),
    claimableTo: new Date("2025-01-22T23:59:59Z"),
  },
];
