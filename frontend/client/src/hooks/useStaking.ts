/**
 * Hook for PULSE staking operations on Aleo
 * Handles stake, unstake, and view functions for the staking contract
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNetwork } from "@/contexts/NetworkContext";
import { useAleoWallet } from "@/hooks/useAleoWallet";
import { useAleoStaking, calculateEstimatedAPY } from "@/hooks/useAleoStaking";

// Lock period options (in blocks, ~1 second per block on Aleo)
// `seconds` is an alias for `blocks` for backward compatibility
export const LOCK_PERIODS = [
  { days: 7, blocks: 604800, seconds: 604800, label: "7 days" },
  { days: 14, blocks: 1209600, seconds: 1209600, label: "14 days" },
  { days: 21, blocks: 1814400, seconds: 1814400, label: "21 days" },
  { days: 30, blocks: 2592000, seconds: 2592000, label: "30 days" },
  { days: 90, blocks: 7776000, seconds: 7776000, label: "90 days" },
  { days: 180, blocks: 15552000, seconds: 15552000, label: "180 days" },
  { days: 365, blocks: 31536000, seconds: 31536000, label: "1 year" },
] as const;

export interface StakePosition {
  amount: number;
  stakedAt: number;
  lockDuration: number;
  unlockAt: number;
  isUnlocked: boolean;
}

export interface StakingInfo {
  totalStaked: number;
  positions: StakePosition[];
  unlockableAmount: number;
  lockedAmount: number;
  poolTotalStaked: number;
  stakersCount: number;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
}

export function useStaking() {
  const { config, network } = useNetwork();
  const { connected, address, executeTransaction, stake, unstake } = useAleoWallet();
  const { usePoolInfo, useUserTotalStaked, useUserPositionCount, refreshStaking } = useAleoStaking();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const stakingContractAddress = config.stakingProgramId;

  // Get pool info from Aleo staking hook
  const poolInfoQuery = usePoolInfo();

  // Get user staking info
  const userTotalStakedQuery = useUserTotalStaked(address);
  const userPositionCountQuery = useUserPositionCount(address);

  // ==================== React Query ====================

  // Query for staking info (combines data from Aleo hooks)
  const stakingInfoQuery = useQuery<StakingInfo>({
    queryKey: ["stakingInfo", address, stakingContractAddress],
    queryFn: async () => {
      const totalStaked = userTotalStakedQuery.data ?? BigInt(0);
      const poolInfo = poolInfoQuery.data;

      return {
        totalStaked: Number(totalStaked),
        positions: [], // Position details would need separate queries
        unlockableAmount: 0,
        lockedAmount: Number(totalStaked),
        poolTotalStaked: poolInfo ? Number(poolInfo.totalStaked) : 0,
        stakersCount: poolInfo ? Number(poolInfo.stakersCount) : 0,
      };
    },
    enabled: !!address && !!stakingContractAddress,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // ==================== Entry Functions ====================

  // Stake PULSE
  const stakeMutation = useMutation({
    mutationFn: async ({ amount, lockPeriod }: { amount: number; lockPeriod: number }) => {
      setLoading(true);
      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }
        const txId = await stake(BigInt(amount), lockPeriod);
        return { hash: txId || "", success: !!txId };
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      refreshStaking();
      queryClient.invalidateQueries({ queryKey: ["stakingInfo", address] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", address] });
    },
  });

  // Unstake using receipt
  const unstakeMutation = useMutation({
    mutationFn: async ({ receipt }: { receipt: string }) => {
      setLoading(true);
      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }
        const txId = await unstake(receipt);
        return { hash: txId || "", success: !!txId };
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      refreshStaking();
      queryClient.invalidateQueries({ queryKey: ["stakingInfo", address] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", address] });
    },
  });

  // Unstake all unlocked positions
  const unstakeAllMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }
        const txId = await executeTransaction({
          programId: stakingContractAddress,
          functionName: "unstake_all",
          inputs: [],
        });
        return { hash: txId || "", success: !!txId };
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      refreshStaking();
      queryClient.invalidateQueries({ queryKey: ["stakingInfo", address] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", address] });
    },
  });

  return {
    // Contract info
    stakingContractAddress,
    isConfigured: !!stakingContractAddress,

    // State
    loading,
    isLoading: stakingInfoQuery.isLoading || poolInfoQuery.isLoading,
    isError: stakingInfoQuery.isError || poolInfoQuery.isError,
    error: stakingInfoQuery.error || poolInfoQuery.error,

    // Staking info
    totalStaked: stakingInfoQuery.data?.totalStaked ?? 0,
    positions: stakingInfoQuery.data?.positions ?? [],
    unlockableAmount: stakingInfoQuery.data?.unlockableAmount ?? 0,
    lockedAmount: stakingInfoQuery.data?.lockedAmount ?? 0,
    poolTotalStaked: stakingInfoQuery.data?.poolTotalStaked ?? 0,
    stakersCount: stakingInfoQuery.data?.stakersCount ?? 0,

    // Actions
    stake: stakeMutation.mutateAsync,
    unstake: unstakeMutation.mutateAsync,
    unstakeAll: unstakeAllMutation.mutateAsync,

    // Action states
    isStaking: stakeMutation.isPending,
    isUnstaking: unstakeMutation.isPending || unstakeAllMutation.isPending,

    // Refetch
    refetch: () => {
      refreshStaking();
      stakingInfoQuery.refetch();
    },

    // APY calculation
    calculateEstimatedAPY,
  };
}
