/**
 * Balance fetching utilities for Aleo network
 * Supports native Aleo credits and token_registry tokens
 */

import {
  CoinTypeId,
  COIN_TYPES,
  getCoinSymbol,
  getCoinDecimals,
  formatTokenAmount,
} from "./tokens";
import { createIndexer } from "./aleo-indexer";

export interface AccountBalance {
  balance: bigint;
  balanceFormatted: string;
  exists: boolean;
  symbol: string;
}

export interface AllBalances {
  [COIN_TYPES.CREDITS]: AccountBalance;
  [COIN_TYPES.PULSE]: AccountBalance;
  [COIN_TYPES.STABLE]: AccountBalance;
}

/**
 * Fetch Aleo credits balance (native token for fees)
 */
async function getCreditsBalance(
  address: string,
  provableApiUrl: string
): Promise<AccountBalance> {
  const symbol = getCoinSymbol(COIN_TYPES.CREDITS);

  try {
    // Query the credits.aleo program's account mapping
    const response = await fetch(
      `${provableApiUrl}/testnet/program/credits.aleo/mapping/account/${address}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          balance: 0n,
          balanceFormatted: "0.0000",
          exists: false,
          symbol,
        };
      }
      throw new Error(`Failed to fetch balance: ${response.status}`);
    }

    const data = await response.json();
    // credits.aleo returns balance in microcredits (u64)
    const balance = BigInt(data?.replace("u64", "") || "0");

    return {
      balance,
      balanceFormatted: formatTokenAmount(balance, COIN_TYPES.CREDITS),
      exists: true,
      symbol,
    };
  } catch (error) {
    console.error("Error fetching credits balance:", error);
    return {
      balance: 0n,
      balanceFormatted: "0.0000",
      exists: false,
      symbol,
    };
  }
}

/**
 * Fetch token balance from token_registry
 * Tokens are registered in token_registry.aleo with public balances
 */
async function getTokenBalance(
  address: string,
  tokenId: string,
  coinTypeId: CoinTypeId,
  explorerApiUrl: string,
  provableApiUrl: string
): Promise<AccountBalance> {
  const symbol = getCoinSymbol(coinTypeId);

  try {
    const indexer = createIndexer(explorerApiUrl, provableApiUrl);

    // token_registry uses: balances mapping with key = hash(token_id, address)
    // For public balances, query the authorized_balances mapping
    // Key format: (token_id, address) -> u128
    const key = `${tokenId}_${address}`;

    const balanceStr = await indexer.getMappingValue(
      "token_registry.aleo",
      "authorized_balances",
      key
    );

    if (!balanceStr) {
      return {
        balance: 0n,
        balanceFormatted: "0.0000",
        exists: false,
        symbol,
      };
    }

    // Parse the balance (u128 format)
    const balance = BigInt(balanceStr.replace("u128", ""));

    return {
      balance,
      balanceFormatted: formatTokenAmount(balance, coinTypeId),
      exists: true,
      symbol,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol} balance:`, error);
    return {
      balance: 0n,
      balanceFormatted: "0.0000",
      exists: false,
      symbol,
    };
  }
}

/**
 * Fetch the balance for a specific coin type
 */
export async function getAccountBalance(
  address: string,
  explorerApiUrl: string,
  provableApiUrl: string,
  coinTypeId: CoinTypeId = COIN_TYPES.CREDITS,
  tokenId?: string
): Promise<AccountBalance> {
  if (coinTypeId === COIN_TYPES.CREDITS) {
    return getCreditsBalance(address, provableApiUrl);
  }

  // For token_registry tokens, we need the token ID
  const actualTokenId =
    tokenId ||
    (coinTypeId === COIN_TYPES.PULSE
      ? import.meta.env.VITE_PULSE_TOKEN_ID || "1field"
      : import.meta.env.VITE_STABLE_TOKEN_ID || "2field");

  return getTokenBalance(address, actualTokenId, coinTypeId, explorerApiUrl, provableApiUrl);
}

/**
 * Fetch all balances (CREDITS, PULSE, STABLE) for an account
 */
export async function getAllBalances(
  address: string,
  explorerApiUrl: string,
  provableApiUrl: string
): Promise<AllBalances> {
  const [creditsBalance, pulseBalance, stableBalance] = await Promise.all([
    getAccountBalance(address, explorerApiUrl, provableApiUrl, COIN_TYPES.CREDITS),
    getAccountBalance(address, explorerApiUrl, provableApiUrl, COIN_TYPES.PULSE),
    getAccountBalance(address, explorerApiUrl, provableApiUrl, COIN_TYPES.STABLE),
  ]);

  return {
    [COIN_TYPES.CREDITS]: creditsBalance,
    [COIN_TYPES.PULSE]: pulseBalance,
    [COIN_TYPES.STABLE]: stableBalance,
  };
}

/**
 * Format balance from smallest unit to human readable with proper decimals
 */
export function formatBalance(
  smallestUnit: bigint | number,
  tokenDecimals: number = 8,
  displayDecimals: number = 4
): string {
  const amount =
    typeof smallestUnit === "bigint"
      ? smallestUnit
      : BigInt(Math.floor(smallestUnit));
  const divisor = BigInt(10 ** tokenDecimals);

  const whole = amount / divisor;
  const remainder = amount % divisor;
  const decimalPart = remainder.toString().padStart(tokenDecimals, "0").slice(0, displayDecimals);

  return `${whole}.${decimalPart}`;
}

/**
 * Parse token amount to smallest unit
 */
export function parseToSmallestUnit(amount: number, decimals: number = 8): bigint {
  return BigInt(Math.floor(amount * 10 ** decimals));
}

/**
 * Format balance with symbol
 */
export function formatBalanceWithSymbol(
  smallestUnit: bigint | number,
  coinTypeId: CoinTypeId,
  displayDecimals: number = 4
): string {
  const tokenDecimals = getCoinDecimals(coinTypeId);
  const formatted = formatBalance(
    typeof smallestUnit === "bigint" ? smallestUnit : BigInt(smallestUnit),
    tokenDecimals,
    displayDecimals
  );
  const symbol = getCoinSymbol(coinTypeId);
  return `${formatted} ${symbol}`;
}
