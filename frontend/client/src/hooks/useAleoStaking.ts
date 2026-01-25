/**
 * Aleo Staking Hook
 * Fetches and manages staking data from the Aleo network
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useNetwork } from "@/contexts/NetworkContext";
import { createIndexer, parseStakePosition, type StakePosition } from "@/lib/aleo-indexer";
import { parseU64, parseU128, formatLockPeriod } from "@/lib/aleo-encoding";

export interface StakingPoolInfo {
  admin: string;
  tokenId: string;
  isInitialized: boolean;
  totalStaked: bigint;
  stakersCount: bigint;
}

export interface UserStakingInfo {
  totalStaked: bigint;
  positionCount: number;
  positions: StakePosition[];
}

export function useAleoStaking() {
  const { config } = useNetwork();
  const queryClient = useQueryClient();

  // Create indexer instance
  const indexer = useMemo(
    () => createIndexer(config.explorerApiUrl, config.provableApiUrl),
    [config.explorerApiUrl, config.provableApiUrl]
  );

  /**
   * Fetch staking pool info
   */
  const usePoolInfo = () =>
    useQuery({
      queryKey: ["stakingPool", config.stakingProgramId],
      queryFn: async () => {
        const value = await indexer.getMappingValue(
          config.stakingProgramId,
          "pool_config",
          "0u8"
        );

        if (!value) {
          return null;
        }

        // Parse the pool config struct
        try {
          const match = value.match(/\{([^}]+)\}/);
          if (!match) return null;

          const content = match[1];
          const fields: Record<string, string> = {};

          const pairs = content.split(",").map((p) => p.trim());
          for (const pair of pairs) {
            const [key, val] = pair.split(":").map((s) => s.trim());
            if (key && val) {
              fields[key] = val;
            }
          }

          return {
            admin: fields.admin || "",
            tokenId: fields.token_id || "",
            isInitialized: fields.is_initialized === "true",
            totalStaked: BigInt(fields.total_staked?.replace("u128", "") || "0"),
            stakersCount: BigInt(fields.stakers_count?.replace("u64", "") || "0"),
          } as StakingPoolInfo;
        } catch (error) {
          console.error("Error parsing pool config:", error);
          return null;
        }
      },
      staleTime: 30000,
    });

  /**
   * Fetch user's total staked amount
   */
  const useUserTotalStaked = (userAddress: string | null) =>
    useQuery({
      queryKey: ["userTotalStaked", config.stakingProgramId, userAddress],
      queryFn: async () => {
        if (!userAddress) return BigInt(0);

        const value = await indexer.getMappingValue(
          config.stakingProgramId,
          "user_total_staked",
          userAddress
        );

        return value ? parseU64(value) : BigInt(0);
      },
      enabled: !!userAddress,
      staleTime: 30000,
    });

  /**
   * Fetch user's position count
   */
  const useUserPositionCount = (userAddress: string | null) =>
    useQuery({
      queryKey: ["userPositionCount", config.stakingProgramId, userAddress],
      queryFn: async () => {
        if (!userAddress) return 0;

        const value = await indexer.getMappingValue(
          config.stakingProgramId,
          "user_position_count",
          userAddress
        );

        return value ? parseInt(value.replace("u8", ""), 10) : 0;
      },
      enabled: !!userAddress,
      staleTime: 30000,
    });

  /**
   * Invalidate staking queries to refresh data
   */
  const refreshStaking = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["stakingPool"] });
    queryClient.invalidateQueries({ queryKey: ["userTotalStaked"] });
    queryClient.invalidateQueries({ queryKey: ["userPositionCount"] });
  }, [queryClient]);

  return {
    usePoolInfo,
    useUserTotalStaked,
    useUserPositionCount,
    refreshStaking,
  };
}

/**
 * Format staking APY (placeholder - would need oracle/external data)
 */
export function calculateEstimatedAPY(lockPeriodSeconds: number): number {
  // Base APY increases with longer lock periods
  const baseAPY = 5; // 5% base
  const days = lockPeriodSeconds / 86400;

  if (days >= 365) return baseAPY + 15; // 20%
  if (days >= 180) return baseAPY + 10; // 15%
  if (days >= 90) return baseAPY + 6; // 11%
  if (days >= 30) return baseAPY + 3; // 8%
  if (days >= 14) return baseAPY + 1.5; // 6.5%
  return baseAPY + 0.5; // 5.5% for 7 days
}
