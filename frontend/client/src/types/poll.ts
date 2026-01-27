// TypeScript types matching the Aleo contract structs

// Poll status constants
export const POLL_STATUS = {
  ACTIVE: 0,
  CLOSED: 1,
  CLAIMING: 2, // For Manual Pull - participants can claim rewards
  FINALIZED: 3, // Poll finalized, no more claims allowed
} as const;

// Distribution mode constants
export const DISTRIBUTION_MODE = {
  UNSET: 255,      // Not yet selected (selected at close time)
  MANUAL_PULL: 0,  // Participants manually claim rewards
  MANUAL_PUSH: 1,  // Creator triggers distribution to all
} as const;

// Coin type constants (must match contract)
export const COIN_TYPE = {
  CREDITS: 0,  // Aleo Credits
  PULSE: 1,    // PULSE token
} as const;

// Reward type for UI (not stored in contract, derived from reward_per_vote)
export const REWARD_TYPE = {
  NONE: 0,           // No rewards
  FIXED_PER_VOTE: 1, // Fixed amount per voter (reward_per_vote > 0)
  EQUAL_SPLIT: 2,    // Equal split of total fund (reward_per_vote = 0)
} as const;

// Platform fee in basis points (100 = 1%)
export const PLATFORM_FEE_BPS = 200; // 2%

export interface Poll {
  id: number;
  creator: string;
  title: string;
  description: string;
  options: string[];
  votes: number[];
  voters: string[];
  reward_per_vote: number;        // Fixed amount per voter (0 = equal split mode)
  reward_pool: number;            // Net funds after platform fee (in microcredits)
  max_voters: number;             // Maximum voters allowed (0 = unlimited)
  distribution_mode: number;      // 255 = unset, 0 = pull, 1 = push
  claimed: string[];              // Addresses that have claimed rewards
  rewards_distributed: boolean;   // Whether rewards have been distributed
  end_time: number;
  status: number;
  coin_type_id: number;           // 0 = Credits, 1 = PULSE
  closed_at: number;              // Timestamp when poll entered CLAIMING status (0 if not closed)
}

// Poll with computed fields for UI
export interface PollWithMeta extends Poll {
  totalVotes: number;
  isActive: boolean;
  timeRemaining: string;
  votePercentages: number[];
}

// Privacy mode constants for ZK voting
export const PRIVACY_MODE = {
  ANONYMOUS: 0,      // Vote choices in private records, only aggregate counts public
  SEMI_PRIVATE: 1,   // Identity public, specific choice private
  IDENTIFIED: 2,     // Voter identity and choices both publicly visible
} as const;

// Poll visibility modes
export const POLL_VISIBILITY = {
  PUBLIC: 0,   // Visible to everyone
  PRIVATE: 1,  // Invite-only, requires PollInvite record
} as const;

// Type for poll invite record (from Leo contract)
export interface PollInvite {
  owner: string;
  poll_id: number;
  can_vote: boolean;
  expires_block: number;
}

// Type for poll settings (from poll_settings mapping)
export interface PollSettings {
  privacy_mode: number;      // 0=Anonymous, 1=Semi-Private, 2=Identified
  show_results_live: boolean;
  require_receipt: boolean;
  visibility: number;        // 0=Public, 1=Private (invite-only)
}

// Type for poll ticket record (creator's ownership proof)
export interface PollTicket {
  owner: string;
  poll_id: number;
}

// ============================================
// DONATION TYPES
// ============================================

// Donation privacy modes (must match contract and schema)
export const DONATION_PRIVACY = {
  PUBLIC: 0,        // Donor identity and amount visible
  ANONYMOUS: 1,     // Fully anonymous, only aggregate visible
  SEMI_ANONYMOUS: 2, // Anonymous by default, can reveal later
} as const;

export const DONATION_PRIVACY_NAMES = {
  [DONATION_PRIVACY.PUBLIC]: "Public",
  [DONATION_PRIVACY.ANONYMOUS]: "Anonymous",
  [DONATION_PRIVACY.SEMI_ANONYMOUS]: "Semi-Anonymous",
} as const;

export type DonationPrivacyMode = typeof DONATION_PRIVACY[keyof typeof DONATION_PRIVACY];

// Donation receipt (from Leo contract DonationReceipt record)
export interface DonationReceipt {
  owner: string;
  poll_id: number;
  amount: number;        // In octas
  privacy_mode: DonationPrivacyMode;
  donated_at: number;    // Block height
  commitment_hash: string;
}

// Public donation info (from Leo contract PublicDonation struct)
export interface PublicDonation {
  donor: string;
  poll_id: number;
  amount: number;        // In octas (net amount after fee)
  donated_at: number;    // Block height
}

// Input for making a donation
export interface DonationInput {
  pollId: number;
  amount: number;        // In octas (gross amount before fee)
  privacyMode: DonationPrivacyMode;
}

// Donation stats for a poll
export interface PollDonationStats {
  totalAmount: number;      // Total donations in octas
  totalCount: number;       // Total number of donations
  publicDonations: PublicDonation[];  // List of public donations
  publicCount: number;      // Number of public donations
  anonymousCount: number;   // Number of anonymous donations (derived)
}

// Input for creating a new poll
export interface CreatePollInput {
  title: string;
  description: string;
  options: string[];
  rewardPerVote: number;    // Fixed amount per voter (0 for equal split)
  maxVoters: number;        // Max voters (0 for unlimited, but only for fixed mode)
  durationSecs: number;
  fundAmount: number;       // Total deposit INCLUDING platform fee (in microcredits)
  coinTypeId: number;       // 0 = Credits, 1 = PULSE
  privacyMode?: number;     // 0 = Anonymous (default), 1 = Semi-Private, 2 = Identified
  visibility?: number;      // 0 = Public (default), 1 = Private (invite-only)
}

// Vote input
export interface VoteInput {
  pollId: number;
  optionIndex: number;
}

// Transaction result
export interface TransactionResult {
  hash: string;
  success: boolean;
  sponsored?: boolean;  // Whether gas was sponsored (Coming Soon!)
}

// Error type for contract calls
export interface ContractError {
  code: string;
  message: string;
}

// Platform config (from contract view function)
export interface PlatformConfig {
  feeBps: number;             // Fee in basis points (100 = 1%)
  treasury: string;           // Treasury address
  totalFeesCollected: number; // Total fees collected (in microcredits)
  claimPeriodSecs: number;    // Time period for claiming rewards (in seconds)
}

// Helper functions for fee calculations
export function calculatePlatformFee(grossAmount: number, feeBps: number = PLATFORM_FEE_BPS): number {
  return Math.floor((grossAmount * feeBps) / 10000);
}

export function calculateNetAmount(grossAmount: number, feeBps: number = PLATFORM_FEE_BPS): number {
  return grossAmount - calculatePlatformFee(grossAmount, feeBps);
}

export function calculateGrossAmount(netAmount: number, feeBps: number = PLATFORM_FEE_BPS): number {
  // gross = net / (1 - fee_rate) = net * 10000 / (10000 - feeBps)
  return Math.ceil((netAmount * 10000) / (10000 - feeBps));
}
