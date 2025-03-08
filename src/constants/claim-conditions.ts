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
    badgeId: "0xd1b3f1e744d705b8c52faa3c6f769ddbd6ffe9d8",
  },
  {
    badgeId: "0x202848516cb28dd8b1d69dc8ddda5f42cac97d7f",
    claimableFrom: new Date("2025-03-07T00:00:00Z"),
    claimableTo: new Date("2025-03-08T23:59:59Z"),
    hide: false,
  },
  {
    badgeId: "0xae7271f2a46ee56d7fed9149253a2c395c5e14bc",
    claimableFrom: new Date("2025-03-08T00:00:00Z"),
    claimableTo: new Date("2025-03-08T23:59:59Z"),
    hide: false,
  },
];
