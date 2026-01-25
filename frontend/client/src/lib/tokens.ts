/**
 * Token configuration for LeoPulse on Aleo
 * Supports PULSE token and stablecoin via token_registry
 */

export const COIN_TYPES = {
  CREDITS: 0, // Aleo native credits (for fees)
  PULSE: 1,   // PULSE token
  STABLE: 2,  // Stablecoin
  // Backward compatibility aliases
  MOVE: 0,    // Alias for CREDITS (was MOVE on Movement)
  USDC: 2,    // Alias for STABLE
} as const;

export type CoinTypeId = (typeof COIN_TYPES)[keyof typeof COIN_TYPES];

/**
 * Get the token ID for Aleo token_registry
 * These are the field values registered in token_registry.aleo
 */
export function getTokenId(coinTypeId: CoinTypeId): string {
  switch (coinTypeId) {
    case COIN_TYPES.CREDITS:
      return "0field"; // Native credits don't use token_registry
    case COIN_TYPES.PULSE:
      return import.meta.env.VITE_PULSE_TOKEN_ID || "1field";
    case COIN_TYPES.STABLE:
      return import.meta.env.VITE_STABLE_TOKEN_ID || "2field";
    default:
      return "0field";
  }
}

/**
 * Get the display symbol for a coin type
 */
export function getCoinSymbol(coinTypeId: CoinTypeId): string {
  switch (coinTypeId) {
    case COIN_TYPES.CREDITS:
      return "CREDITS";
    case COIN_TYPES.PULSE:
      return "PULSE";
    case COIN_TYPES.STABLE:
      return "USDC";
    default:
      return "UNKNOWN";
  }
}

/**
 * Get the full display name for a coin type
 */
export function getCoinName(coinTypeId: CoinTypeId): string {
  switch (coinTypeId) {
    case COIN_TYPES.CREDITS:
      return "Aleo Credits";
    case COIN_TYPES.PULSE:
      return "Pulse Token";
    case COIN_TYPES.STABLE:
      return "USD Stablecoin";
    default:
      return "Unknown Token";
  }
}

/**
 * Get the number of decimals for a coin type
 */
export function getCoinDecimals(coinTypeId: CoinTypeId): number {
  switch (coinTypeId) {
    case COIN_TYPES.CREDITS:
      return 6; // Aleo credits use 6 decimals (microcredits)
    case COIN_TYPES.PULSE:
      return 8; // PULSE uses 8 decimals
    case COIN_TYPES.STABLE:
      return 6; // USDC uses 6 decimals
    default:
      return 8;
  }
}

/**
 * Token metadata for display purposes
 */
export const COIN_METADATA: Record<
  CoinTypeId,
  {
    id: CoinTypeId;
    symbol: string;
    name: string;
    decimals: number;
    description: string;
  }
> = {
  [COIN_TYPES.CREDITS]: {
    id: COIN_TYPES.CREDITS,
    symbol: "CREDITS",
    name: "Aleo Credits",
    decimals: 6,
    description: "Native token of Aleo Network (for fees)",
  },
  [COIN_TYPES.PULSE]: {
    id: COIN_TYPES.PULSE,
    symbol: "PULSE",
    name: "Pulse Token",
    decimals: 8,
    description: "LeoPulse governance and rewards token",
  },
  [COIN_TYPES.STABLE]: {
    id: COIN_TYPES.STABLE,
    symbol: "USDC",
    name: "USD Stablecoin",
    decimals: 6,
    description: "USD-pegged stablecoin",
  },
};

/**
 * Get all supported coin types
 */
export function getSupportedCoinTypes(): typeof COIN_METADATA {
  return COIN_METADATA;
}

/**
 * Check if a coin type ID is valid
 */
export function isValidCoinType(coinTypeId: number): coinTypeId is CoinTypeId {
  return (
    coinTypeId === COIN_TYPES.CREDITS ||
    coinTypeId === COIN_TYPES.PULSE ||
    coinTypeId === COIN_TYPES.STABLE
  );
}

/**
 * Format token amount from smallest unit to human readable
 */
export function formatTokenAmount(
  amount: bigint | number,
  coinTypeId: CoinTypeId,
  displayDecimals: number = 4
): string {
  const decimals = getCoinDecimals(coinTypeId);
  const divisor = BigInt(10 ** decimals);
  const amountBigInt = typeof amount === "number" ? BigInt(Math.floor(amount)) : amount;

  const whole = amountBigInt / divisor;
  const remainder = amountBigInt % divisor;

  const decimalPart = remainder.toString().padStart(decimals, "0").slice(0, displayDecimals);
  return `${whole}.${decimalPart}`;
}

/**
 * Get the token metadata address (for Aleo token_registry compatibility)
 * On Aleo, tokens are registered in token_registry.aleo with token IDs
 */
export function getFAMetadataAddress(
  coinTypeId: CoinTypeId,
  _network: "testnet" | "mainnet"
): string {
  // On Aleo, we use token IDs instead of metadata addresses
  return getTokenId(coinTypeId);
}

/**
 * Parse token amount from human readable to smallest unit
 */
export function parseTokenAmount(
  amount: string | number,
  coinTypeId: CoinTypeId
): bigint {
  const decimals = getCoinDecimals(coinTypeId);
  const multiplier = BigInt(10 ** decimals);

  if (typeof amount === "number") {
    return BigInt(Math.floor(amount * 10 ** decimals));
  }

  const [whole, decimal = ""] = amount.split(".");
  const paddedDecimal = decimal.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole || "0") * multiplier + BigInt(paddedDecimal);
}
