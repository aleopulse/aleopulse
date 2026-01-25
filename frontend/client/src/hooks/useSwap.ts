/**
 * Hook for PULSE swap functionality on Aleo
 * Provides AMM pool interactions including swaps and liquidity management
 */

import { useState, useCallback } from "react";
import { useNetwork } from "@/contexts/NetworkContext";
import { useAleoWallet } from "@/hooks/useAleoWallet";
import { useAleoSwap, formatPrice, calculateTVL } from "@/hooks/useAleoSwap";
import { COIN_TYPES, getCoinDecimals, formatTokenAmount } from "@/lib/tokens";
import type { PoolState } from "@/lib/aleo-indexer";

// Types for swap operations
export interface PoolInfo {
  pulseReserve: number;
  stableReserve: number;
  totalLpShares: number;
  feeBps: number;
  pulseReserveFormatted: string;
  stableReserveFormatted: string;
}

export interface SwapQuote {
  amountIn: number;
  amountOut: number;
  priceImpactBps: number;
  amountInFormatted: string;
  amountOutFormatted: string;
  priceImpactPercent: string;
  rate: string;
}

export interface LiquidityPosition {
  shares: number;
  poolPercentage: number;
  pulseValue: number;
  stableValue: number;
  pulseValueFormatted: string;
  stableValueFormatted: string;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  sponsored?: boolean;
}

export function useSwap() {
  const { config, network } = useNetwork();
  const { connected, address, executeTransaction, swapPulseToStable, swapStableToPulse } = useAleoWallet();
  const {
    usePoolState,
    useUserLpPosition,
    getQuotePulseToStable,
    getQuoteStableToPulse,
    calculateLpTokens,
    calculateRemoveLiquidity,
    refreshSwap
  } = useAleoSwap();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swapProgramId = config.swapProgramId;

  // Get pool state from Aleo swap hook
  const poolStateQuery = usePoolState();
  const userLpQuery = useUserLpPosition(address);

  // Convert PoolState to PoolInfo
  const getPoolInfo = useCallback(async (): Promise<PoolInfo | null> => {
    const poolState = poolStateQuery.data;
    if (!poolState) return null;

    return {
      pulseReserve: Number(poolState.pulseReserve),
      stableReserve: Number(poolState.stableReserve),
      totalLpShares: Number(poolState.totalLpShares),
      feeBps: poolState.feeBps,
      pulseReserveFormatted: formatTokenAmount(poolState.pulseReserve, COIN_TYPES.PULSE),
      stableReserveFormatted: formatTokenAmount(poolState.stableReserve, COIN_TYPES.STABLE),
    };
  }, [poolStateQuery.data]);

  // Get swap quote
  const getSwapQuote = useCallback(
    async (amountIn: number, isPulseToStable: boolean): Promise<SwapQuote | null> => {
      const poolState = poolStateQuery.data;
      if (!poolState || amountIn <= 0) return null;

      const quote = isPulseToStable
        ? getQuotePulseToStable(BigInt(amountIn), poolState)
        : getQuoteStableToPulse(BigInt(amountIn), poolState);

      if (!quote) return null;

      const inDecimals = isPulseToStable ? getCoinDecimals(COIN_TYPES.PULSE) : getCoinDecimals(COIN_TYPES.STABLE);
      const outDecimals = isPulseToStable ? getCoinDecimals(COIN_TYPES.STABLE) : getCoinDecimals(COIN_TYPES.PULSE);

      const inAmount = Number(quote.amountIn) / Math.pow(10, inDecimals);
      const outAmount = Number(quote.amountOut) / Math.pow(10, outDecimals);
      const rate = inAmount > 0 ? (outAmount / inAmount).toFixed(6) : "0";

      return {
        amountIn: Number(quote.amountIn),
        amountOut: Number(quote.amountOut),
        priceImpactBps: Math.round(quote.priceImpact * 100),
        amountInFormatted: formatTokenAmount(quote.amountIn, isPulseToStable ? COIN_TYPES.PULSE : COIN_TYPES.STABLE),
        amountOutFormatted: formatTokenAmount(quote.amountOut, isPulseToStable ? COIN_TYPES.STABLE : COIN_TYPES.PULSE),
        priceImpactPercent: quote.priceImpact.toFixed(2),
        rate,
      };
    },
    [poolStateQuery.data, getQuotePulseToStable, getQuoteStableToPulse]
  );

  // Get LP position for an address
  const getLpPosition = useCallback(
    async (targetAddress?: string): Promise<LiquidityPosition | null> => {
      const poolState = poolStateQuery.data;
      const shares = userLpQuery.data ?? BigInt(0);

      if (!poolState) {
        return {
          shares: 0,
          poolPercentage: 0,
          pulseValue: 0,
          stableValue: 0,
          pulseValueFormatted: "0.0000",
          stableValueFormatted: "0.0000",
        };
      }

      const sharesNum = Number(shares);
      const totalShares = Number(poolState.totalLpShares);
      const poolPercentage = totalShares > 0 ? (sharesNum / totalShares) * 100 : 0;
      const pulseValue = totalShares > 0 ? Math.floor((Number(poolState.pulseReserve) * sharesNum) / totalShares) : 0;
      const stableValue = totalShares > 0 ? Math.floor((Number(poolState.stableReserve) * sharesNum) / totalShares) : 0;

      return {
        shares: sharesNum,
        poolPercentage,
        pulseValue,
        stableValue,
        pulseValueFormatted: formatTokenAmount(BigInt(pulseValue), COIN_TYPES.PULSE),
        stableValueFormatted: formatTokenAmount(BigInt(stableValue), COIN_TYPES.STABLE),
      };
    },
    [poolStateQuery.data, userLpQuery.data]
  );

  // Get spot price
  const getSpotPrice = useCallback(async (): Promise<number | null> => {
    const poolState = poolStateQuery.data;
    if (!poolState || poolState.pulseReserve === BigInt(0)) return null;
    return Number(poolState.stableReserve) / Number(poolState.pulseReserve);
  }, [poolStateQuery.data]);

  // Swap PULSE to stable
  const swapPulseToUsdcFn = useCallback(
    async (pulseAmount: number, minStableOut: number): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }

        const txId = await swapPulseToStable(BigInt(pulseAmount), BigInt(minStableOut));
        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to swap";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, swapPulseToStable]
  );

  // Swap stable to PULSE
  const swapUsdcToPulseFn = useCallback(
    async (stableAmount: number, minPulseOut: number): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }

        const txId = await swapStableToPulse(BigInt(stableAmount), BigInt(minPulseOut));
        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to swap";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, swapStableToPulse]
  );

  // Add liquidity to the pool
  const addLiquidity = useCallback(
    async (pulseAmount: number, stableAmount: number, minLpShares: number): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }

        const txId = await executeTransaction({
          programId: swapProgramId,
          functionName: "add_liquidity",
          inputs: [`${pulseAmount}u64`, `${stableAmount}u64`, `${minLpShares}u64`],
        });

        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add liquidity";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, executeTransaction, swapProgramId]
  );

  // Remove liquidity from the pool
  const removeLiquidity = useCallback(
    async (lpShares: number, minPulseOut: number, minStableOut: number): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }

        const txId = await executeTransaction({
          programId: swapProgramId,
          functionName: "remove_liquidity",
          inputs: [`${lpShares}u64`, `${minPulseOut}u64`, `${minStableOut}u64`],
        });

        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to remove liquidity";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, executeTransaction, swapProgramId]
  );

  return {
    // State
    loading,
    error,
    swapAddress: swapProgramId,
    activeAddress: address,

    // Read functions
    getPoolInfo,
    getSwapQuote,
    getLpPosition,
    getSpotPrice,

    // Write functions
    swapPulseToUsdc: swapPulseToUsdcFn,
    swapUsdcToPulse: swapUsdcToPulseFn,
    addLiquidity,
    removeLiquidity,

    // Utilities
    formatPrice,
    calculateTVL,
    refetch: refreshSwap,
  };
}
