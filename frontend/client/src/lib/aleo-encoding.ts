/**
 * Aleo Encoding Utilities
 * Handles string-to-field encoding and other data transformations for Aleo programs
 */

// Maximum bytes that can fit in a field element (safe limit)
const MAX_BYTES_PER_FIELD = 31;

/**
 * Encode a string to a field element
 * Strings longer than 31 bytes will be truncated
 */
export function stringToField(str: string): string {
  if (!str) return "0field";

  // Convert string to UTF-8 bytes
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str.slice(0, MAX_BYTES_PER_FIELD));

  // Convert bytes to BigInt
  let value = BigInt(0);
  for (let i = 0; i < bytes.length; i++) {
    value = value * BigInt(256) + BigInt(bytes[i]);
  }

  return `${value}field`;
}

/**
 * Decode a field element back to a string
 */
export function fieldToString(field: string): string {
  // Remove 'field' suffix and parse
  const valueStr = field.replace("field", "").trim();
  let value = BigInt(valueStr);

  if (value === BigInt(0)) return "";

  // Convert BigInt to bytes
  const bytes: number[] = [];
  while (value > BigInt(0)) {
    bytes.unshift(Number(value % BigInt(256)));
    value = value / BigInt(256);
  }

  // Decode UTF-8 bytes to string
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(bytes));
}

/**
 * Encode a long string into multiple field elements
 * Each field can hold up to 31 bytes
 */
export function stringToFields(str: string, numFields: number = 4): string[] {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const fields: string[] = [];

  for (let i = 0; i < numFields; i++) {
    const start = i * MAX_BYTES_PER_FIELD;
    const end = Math.min(start + MAX_BYTES_PER_FIELD, bytes.length);

    if (start >= bytes.length) {
      fields.push("0field");
      continue;
    }

    const chunk = bytes.slice(start, end);
    let value = BigInt(0);
    for (let j = 0; j < chunk.length; j++) {
      value = value * BigInt(256) + BigInt(chunk[j]);
    }
    fields.push(`${value}field`);
  }

  return fields;
}

/**
 * Decode multiple field elements back to a string
 */
export function fieldsToString(fields: string[]): string {
  const allBytes: number[] = [];

  for (const field of fields) {
    const valueStr = field.replace("field", "").trim();
    let value = BigInt(valueStr);

    if (value === BigInt(0)) continue;

    const bytes: number[] = [];
    while (value > BigInt(0)) {
      bytes.unshift(Number(value % BigInt(256)));
      value = value / BigInt(256);
    }
    allBytes.push(...bytes);
  }

  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(allBytes));
}

/**
 * Convert an address string to Aleo format
 */
export function formatAddress(address: string): string {
  if (!address) return "";
  // Aleo addresses start with 'aleo1'
  if (address.startsWith("aleo1")) return address;
  return address;
}

/**
 * Shorten an address for display
 */
export function shortenAddress(address: string, chars: number = 6): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Convert a u64 number to Aleo format
 */
export function toU64(value: number | bigint | string): string {
  const num = typeof value === "string" ? BigInt(value) : BigInt(value);
  return `${num}u64`;
}

/**
 * Convert a u128 number to Aleo format
 */
export function toU128(value: number | bigint | string): string {
  const num = typeof value === "string" ? BigInt(value) : BigInt(value);
  return `${num}u128`;
}

/**
 * Convert a u32 number to Aleo format
 */
export function toU32(value: number | string): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  return `${num}u32`;
}

/**
 * Convert a u8 number to Aleo format
 */
export function toU8(value: number | string): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  return `${num}u8`;
}

/**
 * Convert a boolean to Aleo format
 */
export function toBool(value: boolean): string {
  return value ? "true" : "false";
}

/**
 * Parse a u64 value from Aleo format
 */
export function parseU64(value: string): bigint {
  return BigInt(value.replace("u64", "").trim());
}

/**
 * Parse a u128 value from Aleo format
 */
export function parseU128(value: string): bigint {
  return BigInt(value.replace("u128", "").trim());
}

/**
 * Parse a u32 value from Aleo format
 */
export function parseU32(value: string): number {
  return parseInt(value.replace("u32", "").trim(), 10);
}

/**
 * Parse a u8 value from Aleo format
 */
export function parseU8(value: string): number {
  return parseInt(value.replace("u8", "").trim(), 10);
}

/**
 * Parse a field value from Aleo format
 */
export function parseField(value: string): bigint {
  return BigInt(value.replace("field", "").trim());
}

/**
 * Parse a boolean value from Aleo format
 */
export function parseBool(value: string): boolean {
  return value.trim() === "true";
}

/**
 * Parse an address from Aleo format
 */
export function parseAddress(value: string): string {
  // Addresses in Aleo are returned as-is
  return value.trim();
}

/**
 * Convert PULSE amount to display format (6 decimals)
 */
export function formatPulseAmount(amount: bigint | string, decimals: number = 6): string {
  const value = typeof amount === "string" ? parseU128(amount) : amount;
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}.${fractionStr}`;
}

/**
 * Convert display amount to PULSE units (6 decimals)
 */
export function parsePulseAmount(amount: string, decimals: number = 6): bigint {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

/**
 * Privacy mode constants matching the Leo contract
 */
export const PRIVACY_MODES = {
  ANONYMOUS: 0,
  SEMI_PRIVATE: 1,
  IDENTIFIED: 2,
} as const;

export type PrivacyMode = (typeof PRIVACY_MODES)[keyof typeof PRIVACY_MODES];

/**
 * Poll status constants matching the Leo contract
 */
export const POLL_STATUS = {
  ACTIVE: 0,
  CLAIMING: 1,
  FINALIZED: 2,
} as const;

export type PollStatus = (typeof POLL_STATUS)[keyof typeof POLL_STATUS];

/**
 * Lock period constants in seconds (matching staking.aleo)
 */
export const LOCK_PERIODS = {
  DAYS_7: 604800,
  DAYS_14: 1209600,
  DAYS_30: 2592000,
  DAYS_90: 7776000,
  DAYS_180: 15552000,
  DAYS_365: 31536000,
} as const;

export type LockPeriod = (typeof LOCK_PERIODS)[keyof typeof LOCK_PERIODS];

/**
 * Format lock period for display
 */
export function formatLockPeriod(seconds: number): string {
  const days = seconds / 86400;
  if (days >= 365) return `${Math.floor(days / 365)} year${days >= 730 ? "s" : ""}`;
  if (days >= 30) return `${Math.floor(days / 30)} month${days >= 60 ? "s" : ""}`;
  return `${days} day${days !== 1 ? "s" : ""}`;
}
