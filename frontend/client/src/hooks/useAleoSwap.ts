/**
 * Aleo Swap Hook
 * Fetches and manages AMM pool data from the Aleo network
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useNetwork } from "@/contexts/NetworkContext";
import { createIndexer, parsePoolState, type PoolState } from "@/lib/aleo-indexer";
import { parseU128 } from "@/lib/aleo-encoding";

export interface SwapQuote {
  amountIn: bigint;
  amountOut: bigint;
  priceImpact: number;
  fee: bigint;
}

export function useAleoSwap() {
  const { config } = useNetwork();
  const queryClient = useQueryClient();

  // Create indexer instance
  const indexer = useMemo(
    () => createIndexer(config.explorerApiUrl, config.provableApiUrl),
    [config.explorerApiUrl, config.provableApiUrl]
  );

  /**
   * Fetch pool state
   */
  const usePoolState = () =>
    useQuery({
      queryKey: ["swapPool", config.swapProgramId],
      queryFn: async () => {
        const value = await indexer.getMappingValue(
          config.swapProgramId,
          "pool",
          "0u8"
        );

        if (!value) return null;
        return parsePoolState(value);
      },
      staleTime: 30000,
    });

  /**
   * Fetch user's LP position
   */
  const useUserLpPosition = (userAddress: string | null) =>
    useQuery({
      queryKey: ["userLpPosition", config.swapProgramId, userAddress],
      queryFn: async () => {
        if (!userAddress) return BigInt(0);

        const value = await indexer.getMappingValue(
          config.swapProgramId,
          "lp_positions",
          userAddress
        );

        return value ? parseU128(value) : BigInt(0);
      },
      enabled: !!userAddress,
      staleTime: 30000,
    });

  /**
   * Calculate swap quote for PULSE to stablecoin
   */
  const getQuotePulseToStable = useCallback(
    (amountIn: bigint, poolState: PoolState | null): SwapQuote | null => {
      if (!poolState || poolState.pulseReserve === BigInt(0)) return null;

      const BPS_DENOMINATOR = BigInt(10000);
      const feeMultiplier = BPS_DENOMINATOR - BigInt(poolState.feeBps);
      const amountInWithFee = amountIn * feeMultiplier;

      const numerator = amountInWithFee * poolState.stableReserve;
      const denominator =
        poolState.pulseReserve * BPS_DENOMINATOR + amountInWithFee;

      const amountOut = numerator / denominator;
      const fee = (amountIn * BigInt(poolState.feeBps)) / BPS_DENOMINATOR;

      // Calculate price impact
      const spotPrice =
        Number(poolState.stableReserve) / Number(poolState.pulseReserve);
      const executionPrice = Number(amountOut) / Number(amountIn);
      const priceImpact = ((spotPrice - executionPrice) / spotPrice) * 100;

      return {
        amountIn,
        amountOut,
        priceImpact: Math.abs(priceImpact),
        fee,
      };
    },
    []
  );

  /**
   * Calculate swap quote for stablecoin to PULSE
   */
  const getQuoteStableToPulse = useCallback(
    (amountIn: bigint, poolState: PoolState | null): SwapQuote | null => {
      if (!poolState || poolState.stableReserve === BigInt(0)) return null;

      const BPS_DENOMINATOR = BigInt(10000);
      const feeMultiplier = BPS_DENOMINATOR - BigInt(poolState.feeBps);
      const amountInWithFee = amountIn * feeMultiplier;

      const numerator = amountInWithFee * poolState.pulseReserve;
      const denominator =
        poolState.stableReserve * BPS_DENOMINATOR + amountInWithFee;

      const amountOut = numerator / denominator;
      const fee = (amountIn * BigInt(poolState.feeBps)) / BPS_DENOMINATOR;

      // Calculate price impact
      const spotPrice =
        Number(poolState.pulseReserve) / Number(poolState.stableReserve);
      const executionPrice = Number(amountOut) / Number(amountIn);
      const priceImpact = ((spotPrice - executionPrice) / spotPrice) * 100;

      return {
        amountIn,
        amountOut,
        priceImpact: Math.abs(priceImpact),
        fee,
      };
    },
    []
  );

  /**
   * Calculate LP tokens for adding liquidity
   */
  const calculateLpTokens = useCallback(
    (
      pulseAmount: bigint,
      stableAmount: bigint,
      poolState: PoolState | null
    ): bigint | null => {
      if (!poolState) return null;

      if (poolState.totalLpShares === BigInt(0)) {
        // First liquidity provision
        // LP = sqrt(pulse * stable) - MINIMUM_LIQUIDITY
        const product = pulseAmount * stableAmount;
        const sqrtProduct = BigInt(Math.floor(Math.sqrt(Number(product))));
        return sqrtProduct - BigInt(1000); // MINIMUM_LIQUIDITY
      }

      // Subsequent provision - take minimum of both ratios
      const sharesFromPulse =
        (pulseAmount * poolState.totalLpShares) / poolState.pulseReserve;
      const sharesFromStable =
        (stableAmount * poolState.totalLpShares) / poolState.stableReserve;

      return sharesFromPulse < sharesFromStable
        ? sharesFromPulse
        : sharesFromStable;
    },
    []
  );

  /**
   * Calculate amounts returned when removing liquidity
   */
  const calculateRemoveLiquidity = useCallback(
    (
      lpShares: bigint,
      poolState: PoolState | null
    ): { pulseOut: bigint; stableOut: bigint } | null => {
      if (!poolState || poolState.totalLpShares === BigInt(0)) return null;

      const pulseOut =
        (lpShares * poolState.pulseReserve) / poolState.totalLpShares;
      const stableOut =
        (lpShares * poolState.stableReserve) / poolState.totalLpShares;

      return { pulseOut, stableOut };
    },
    []
  );

  /**
   * Invalidate swap queries to refresh data
   */
  const refreshSwap = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["swapPool"] });
    queryClient.invalidateQueries({ queryKey: ["userLpPosition"] });
  }, [queryClient]);

  return {
    usePoolState,
    useUserLpPosition,
    getQuotePulseToStable,
    getQuoteStableToPulse,
    calculateLpTokens,
    calculateRemoveLiquidity,
    refreshSwap,
  };
}

/**
 * Format price with appropriate precision
 */
export function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toFixed(4);
  }
  // For small prices, show more decimals
  return price.toFixed(8);
}

/**
 * Calculate TVL from pool state
 */
export function calculateTVL(
  poolState: PoolState | null,
  pulsePrice: number,
  stablePrice: number = 1
): number {
  if (!poolState) return 0;

  const pulseValue =
    (Number(poolState.pulseReserve) / 1e8) * pulsePrice; // 8 decimals
  const stableValue =
    (Number(poolState.stableReserve) / 1e8) * stablePrice; // Assuming 8 decimals

  return pulseValue + stableValue;
}
