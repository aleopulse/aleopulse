/**
 * Aleo Contract Utilities
 * Helpers for interacting with Aleo programs
 */

import type { NetworkConfig } from "@/contexts/NetworkContext";

// Poll status constants (matching the Leo contract)
export const POLL_STATUS = {
  ACTIVE: 0,
  CLAIMING: 1,
  CLOSED: 2,
  FINALIZED: 3,
} as const;

// Privacy mode constants
export const PRIVACY_MODE = {
  ANONYMOUS: 0,    // Vote choices private, only aggregate counts public
  SEMI_PRIVATE: 1, // Identity public, specific choice private
  IDENTIFIED: 2,   // Both identity and choice public
} as const;

/**
 * Format poll status for display
 */
export function formatPollStatus(status: number): string {
  switch (status) {
    case POLL_STATUS.ACTIVE:
      return "active";
    case POLL_STATUS.CLAIMING:
      return "claiming";
    case POLL_STATUS.CLOSED:
      return "closed";
    case POLL_STATUS.FINALIZED:
      return "finalized";
    default:
      return "unknown";
  }
}

/**
 * Check if poll is active (accepting votes)
 * Note: Aleo uses block height instead of timestamps
 */
export function isPollActive(poll: { status: number; end_block: number }, currentBlock: number): boolean {
  return poll.status === POLL_STATUS.ACTIVE && poll.end_block > currentBlock;
}

/**
 * Format blocks remaining
 * Aleo produces approximately 1 block per second
 */
export function formatBlocksRemaining(endBlock: number, currentBlock: number): string {
  const remaining = endBlock - currentBlock;

  if (remaining <= 0) {
    return "Ended";
  }

  // Convert blocks to time (approximately 1 block per second)
  const seconds = remaining;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  } else if (minutes > 0) {
    return `${minutes}m left`;
  } else {
    return `${seconds}s left`;
  }
}

/**
 * Get privacy mode label
 */
export function getPrivacyModeLabel(mode: number): string {
  switch (mode) {
    case PRIVACY_MODE.ANONYMOUS:
      return "Anonymous";
    case PRIVACY_MODE.SEMI_PRIVATE:
      return "Semi-Private";
    case PRIVACY_MODE.IDENTIFIED:
      return "Identified";
    default:
      return "Unknown";
  }
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 10)}...${address.slice(-6)}`;
}

/**
 * Format Aleo address for display (shorter version)
 */
export function shortAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate Aleo address format
 */
export function isValidAleoAddress(address: string): boolean {
  // Aleo addresses start with "aleo1" and are 63 characters long
  return /^aleo1[a-z0-9]{58}$/.test(address);
}

/**
 * Get program ID from config
 */
export function getProgramId(config: NetworkConfig, program: "poll" | "staking" | "swap" | "pulse"): string {
  switch (program) {
    case "poll":
      return config.pollProgramId;
    case "staking":
      return config.stakingProgramId;
    case "swap":
      return config.swapProgramId;
    case "pulse":
      return config.pulseProgramId;
    default:
      return "";
  }
}

/**
 * Encode a string to Aleo field elements
 * Strings are encoded as u128 arrays (16 bytes per field)
 */
export function encodeStringToFields(str: string, maxFields: number = 4): string[] {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const fields: string[] = [];

  for (let i = 0; i < maxFields; i++) {
    const start = i * 16;
    const end = Math.min(start + 16, bytes.length);

    if (start >= bytes.length) {
      fields.push("0u128");
      continue;
    }

    let value = 0n;
    for (let j = start; j < end; j++) {
      value |= BigInt(bytes[j]) << BigInt((j - start) * 8);
    }
    fields.push(`${value}u128`);
  }

  return fields;
}

/**
 * Decode Aleo field elements back to string
 */
export function decodeFieldsToString(fields: string[]): string {
  const bytes: number[] = [];

  for (const field of fields) {
    let value = BigInt(field.replace("u128", ""));
    for (let i = 0; i < 16; i++) {
      const byte = Number(value & 0xffn);
      if (byte !== 0) {
        bytes.push(byte);
      }
      value >>= 8n;
    }
  }

  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(bytes));
}
