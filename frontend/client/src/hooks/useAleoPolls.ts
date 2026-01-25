/**
 * Aleo Polls Hook
 * Fetches and manages poll data from the Aleo network
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useNetwork } from "@/contexts/NetworkContext";
import { createIndexer, parsePollInfo, type PollInfo } from "@/lib/aleo-indexer";
import { fieldToString, parseU64 } from "@/lib/aleo-encoding";

export interface Poll extends PollInfo {
  id: bigint;
  titleDecoded: string;
  descriptionDecoded: string;
  optionsDecoded: string[];
  voteCounts: bigint[];
}

export function useAleoPolls() {
  const { config } = useNetwork();
  const queryClient = useQueryClient();

  // Create indexer instance
  const indexer = useMemo(
    () => createIndexer(config.explorerApiUrl, config.provableApiUrl),
    [config.explorerApiUrl, config.provableApiUrl]
  );

  /**
   * Fetch poll count
   */
  const usePollCount = () =>
    useQuery({
      queryKey: ["pollCount", config.pollProgramId],
      queryFn: async () => {
        const value = await indexer.getMappingValue(
          config.pollProgramId,
          "poll_count",
          "0u8"
        );
        return value ? parseU64(value) : BigInt(0);
      },
      staleTime: 30000, // 30 seconds
    });

  /**
   * Fetch a single poll by ID
   */
  const usePoll = (pollId: bigint | null) =>
    useQuery({
      queryKey: ["poll", config.pollProgramId, pollId?.toString()],
      queryFn: async () => {
        if (pollId === null) return null;

        // Fetch poll info
        const pollValue = await indexer.getMappingValue(
          config.pollProgramId,
          "polls",
          `${pollId}u64`
        );

        if (!pollValue) return null;

        const pollInfo = parsePollInfo(pollValue);
        if (!pollInfo) return null;

        // Fetch options
        const options: string[] = [];
        for (let i = 0; i < 4; i++) {
          const optionKey = `${pollId}u64_${i}u8`; // Simplified key format
          const optionValue = await indexer.getMappingValue(
            config.pollProgramId,
            "poll_options",
            optionKey
          );
          if (optionValue) {
            options.push(fieldToString(optionValue));
          }
        }

        // Fetch vote counts
        const voteCounts: bigint[] = [];
        for (let i = 0; i < options.length; i++) {
          const countValue = await indexer.getMappingValue(
            config.pollProgramId,
            "vote_counts",
            `${pollId}u64_${i}u8`
          );
          voteCounts.push(countValue ? parseU64(countValue) : BigInt(0));
        }

        const poll: Poll = {
          ...pollInfo,
          id: pollId,
          titleDecoded: fieldToString(pollInfo.title),
          descriptionDecoded: fieldToString(pollInfo.description),
          optionsDecoded: options,
          voteCounts,
        };

        return poll;
      },
      enabled: pollId !== null,
      staleTime: 30000,
    });

  /**
   * Fetch all polls (paginated)
   */
  const usePolls = (page: number = 0, limit: number = 10) =>
    useQuery({
      queryKey: ["polls", config.pollProgramId, page, limit],
      queryFn: async () => {
        // Get poll count first
        const countValue = await indexer.getMappingValue(
          config.pollProgramId,
          "poll_count",
          "0u8"
        );
        const totalCount = countValue ? parseU64(countValue) : BigInt(0);

        if (totalCount === BigInt(0)) {
          return { polls: [], totalCount: BigInt(0), page, limit };
        }

        // Fetch polls for this page
        const start = BigInt(page * limit);
        const end = start + BigInt(limit);
        const polls: Poll[] = [];

        for (let i = start; i < end && i < totalCount; i++) {
          const pollValue = await indexer.getMappingValue(
            config.pollProgramId,
            "polls",
            `${i}u64`
          );

          if (pollValue) {
            const pollInfo = parsePollInfo(pollValue);
            if (pollInfo) {
              polls.push({
                ...pollInfo,
                id: i,
                titleDecoded: fieldToString(pollInfo.title),
                descriptionDecoded: fieldToString(pollInfo.description),
                optionsDecoded: [],
                voteCounts: [],
              });
            }
          }
        }

        return { polls, totalCount, page, limit };
      },
      staleTime: 30000,
    });

  /**
   * Check if user has voted on a poll
   */
  const useHasVoted = (pollId: bigint | null, userAddress: string | null) =>
    useQuery({
      queryKey: ["hasVoted", config.pollProgramId, pollId?.toString(), userAddress],
      queryFn: async () => {
        if (pollId === null || !userAddress) return false;

        // The key is hash(poll_id, voter_address) - simplified version
        const value = await indexer.getMappingValue(
          config.pollProgramId,
          "voters",
          `${pollId}u64_${userAddress}`
        );

        return value === "true";
      },
      enabled: pollId !== null && !!userAddress,
      staleTime: 30000,
    });

  /**
   * Invalidate poll queries to refresh data
   */
  const refreshPolls = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["polls"] });
    queryClient.invalidateQueries({ queryKey: ["poll"] });
    queryClient.invalidateQueries({ queryKey: ["pollCount"] });
  }, [queryClient]);

  return {
    usePollCount,
    usePoll,
    usePolls,
    useHasVoted,
    refreshPolls,
  };
}

/**
 * Hook for fetching current block height
 */
export function useBlockHeight() {
  const { config } = useNetwork();

  const indexer = useMemo(
    () => createIndexer(config.explorerApiUrl, config.provableApiUrl),
    [config.explorerApiUrl, config.provableApiUrl]
  );

  return useQuery({
    queryKey: ["blockHeight"],
    queryFn: () => indexer.getBlockHeight(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
